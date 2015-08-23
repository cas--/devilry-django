# Django imports
from django.core.exceptions import PermissionDenied
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django import http
from django.core.urlresolvers import reverse
from django import forms

# Python imports
import json
import datetime
import collections

# Devilry imports
from django_cradmin.apps.cradmin_temporaryfileuploadstore.models import TemporaryFileCollection
from devilry.devilry_group import models
from devilry.devilry_comment import models as comment_models

# 3rd party imports
from crispy_forms import layout
from django_cradmin.acemarkdown.widgets import AceMarkdownWidget
from django_cradmin.viewhelpers import create
from xml.sax.saxutils import quoteattr


class FeedbackFeedBaseView(create.CreateView):
    template_name = "devilry_group/feedbackfeed.django.html"

    # for cradmin CreateView
    model=models.GroupComment
    fields=["text"]
    form_attributes = {
        'django-cradmin-bulkfileupload-form': ''
    }

    def _get_comments_for_group(self, group):
        raise NotImplementedError("Subclasses must implement _get_queryset_for_group!")

    def _get_feedbacksets_for_group(self, group):
        return models.FeedbackSet.objects.filter(group=group)

    def __add_comments_to_timeline(self, group, timeline):
        comments = self._get_comments_for_group(group)
        for comment in comments:
            if comment.published_datetime not in timeline.keys():
                timeline[comment.published_datetime] = []
            timeline[comment.published_datetime].append({
                "type": "comment",
                "obj": comment
            })
        return timeline

    def __add_announcements_to_timeline(self, feedbacksets, timeline):
        if len(feedbacksets) == 0:
            return timeline
        first_feedbackset = feedbacksets[0]
        last_deadline = first_feedbackset.deadline_datetime
        for feedbackset in feedbacksets[0:]:
            if feedbackset.deadline_datetime not in timeline.keys():
                timeline[feedbackset.deadline_datetime] = []
            timeline[feedbackset.deadline_datetime].append({
                "type": "deadline_expired"
            })
            if feedbackset.created_datetime not in timeline.keys():
                timeline[feedbackset.created_datetime] = []

            if feedbackset.deadline_datetime < first_feedbackset.deadline_datetime:
                timeline[feedbackset.created_datetime].append({
                    "type": "deadline_created",
                    "obj": first_feedbackset.deadline_datetime,
                    "user": first_feedbackset.created_by
                })
                first_feedbackset = feedbackset
            elif feedbackset is not feedbacksets[0]:
                timeline[feedbackset.created_datetime].append({
                    "type": "deadline_created",
                    "obj": feedbackset.deadline_datetime,
                    "user": feedbackset.created_by
                })
            if feedbackset.deadline_datetime > last_deadline:
                last_deadline = feedbackset.deadline_datetime

            if feedbackset.published_datetime is not None:
                if feedbackset.published_datetime not in timeline.keys():
                    timeline[feedbackset.published_datetime] = []
                timeline[feedbackset.published_datetime].append({
                    "type": "grade",
                    "obj": feedbackset.points
                })
        return last_deadline, timeline

    def __sort_timeline(self, timeline):
        sorted_timeline = collections.OrderedDict(sorted(timeline.items()))
        return sorted_timeline

    def __build_timeline(self, group, feedbacksets):
        timeline = {}
        timeline = self.__add_comments_to_timeline(group, timeline)
        last_deadline, timeline = self.__add_announcements_to_timeline(feedbacksets, timeline)
        timeline = self.__sort_timeline(timeline)

        return last_deadline, timeline

    def get_context_data(self, **kwargs):
        context = super(FeedbackFeedBaseView, self).get_context_data(**kwargs)
        context['subject'] = self.request.cradmin_role.assignment.period.subject
        context['assignment'] = self.request.cradmin_role.assignment
        context['period'] = self.request.cradmin_role.assignment.period

        feedbacksets = self._get_feedbacksets_for_group(self.request.cradmin_role)
        context['last_deadline'], context['timeline'] = self.__build_timeline(self.request.cradmin_role, feedbacksets)
        context['feedbacksets'] = feedbacksets
        context['last_feedbackset'] = feedbacksets[0]
        context['current_date'] = datetime.datetime.now()

        return context

    submit_use_label = _('Post comment')

    def get_form_css_classes(self):
        """
        Returns list of css classes set on the form. You normally
        want to override :meth:`.get_extra_form_css_classes` instead
        of this method unless you want to provide completely custom
        form styles.
        """
        form_css_classes = [
        ]
        return form_css_classes

    def get_button_layout(self):
        """
        Get the button layout. This is added to the crispy form layout.

        Defaults to a :class:`crispy_forms.layout.Div` with css class
        ``django_cradmin_submitrow`` containing all the buttons
        returned by :meth:`.get_buttons`.
        """
        return [
        ]

    def get_buttons(self):
        app = self.request.cradmin_app
        user = self.request.user
        if self.request.cradmin_role.is_candidate(user):
            return [layout.Submit('student_add_comment',
                           _('Add comment'),
                           css_class='btn btn-success')]
        elif self.request.cradmin_role.is_examiner(user):
            return [layout.Submit('examiner_add_comment_for_examiners',
                           _('Add comment for examiners'),
                           css_class='btn btn-primary'),
                    layout.Submit('examiner_add_public_comment',
                           _('Add public comment'),
                           css_class='btn btn-primary'),
                    layout.Submit('examiner_add_comment_to_feedback_draft',
                           _('Add to feedback'),
                           css_class='btn btn-primary')
                    ]

    def get_field_layout(self):
        return [
            layout.Fieldset(
                '',
                layout.Div(
                    layout.Div(
                        'text',
                        # css_class='panel-body'
                    ),
                    layout.Div(
                        layout.HTML(render_to_string('devilry_group/include/fileupload.django.html',
                                                     {
                                                         "apiparameters": quoteattr(json.dumps({
                                                             "unique_filenames": True,
                                                             "max_filename_length": comment_models.CommentFile.MAX_FILENAME_LENGTH
                                                         })),
                                                         "hiddenfieldname": "temporary_file_collection_id",
                                                         "apiurl": reverse('cradmin_temporary_file_upload_api')
                                                      })),
                        # css_class='panel-footer'
                    ),
                    # css_class='panel panel-default'
                ),
                layout.Div(
                    layout.Div(*self.get_buttons()),
                    css_class="col-xs-12 text-right"
                ),
                css_class='comment-form-container'
            )
        ]

    def get_form(self, form_class=None):
        form = super(FeedbackFeedBaseView, self).get_form(form_class=form_class)
        # form.fields['text'].widget = WysiHtmlTextArea(attrs={})
        form.fields['text'].widget = AceMarkdownWidget()
        form.fields['text'].label = False
        form.fields['temporary_file_collection_id'] = forms.IntegerField()
        return form

    def save_object(self, form, commit=True):
        print '\nsave object from form\n'

        assignment_group = self.request.cradmin_role
        user = self.request.user
        time = datetime.datetime.now()

        object = form.save(commit=False)
        object.user = user
        object.comment_type = 'groupcomment'
        object.feedback_set = assignment_group.feedbackset_set.latest('created_datetime')
        object.published_datetime = time

        if assignment_group.is_candidate(user):
            object.user_role = 'student'
            object.instant_publish = True
            object.visible_for_students = True
        elif assignment_group.is_examiner(user):
            object.user_role = 'examiner'
            print 'is examiner'

            if form.data.get('examiner_add_comment_for_examiners'):
                print 'examiner_add_comment_for_examiners'
                object.instant_publish = True
                object.visible_for_students = False
            elif form.data.get('examiner_add_public_comment'):
                print 'examiner_add_public_comment'
                object.instant_publish = True
                object.visible_for_students = True
            elif form.data.get('examiner_add_comment_to_feedback_draft'):
                print 'examiner_add_comment_to_feedback_draft'
                object.instant_publish = False
                object.visible_for_students = False
        elif assignment_group.is_admin_or_superadmin(user):
            object.user_role = 'admin'
            object.instant_publish = True
            object.visible_for_students = True
        else:
            raise PermissionDenied("User attempting to post comment has no verified role in the assignment group!")

        if commit:
            object.save()
            self.__convert_temporary_files_to_comment_files(form, object)
        return object

    def get_collectionqueryset(self):
        return TemporaryFileCollection.objects \
            .filter_for_user(self.request.user) \
            .prefetch_related('files')

    def __convert_temporary_files_to_comment_files(self, form, groupcomment):
        filecollection_id = form.cleaned_data.get('temporary_file_collection_id')
        if not filecollection_id:
            return
        try:
            temporaryfilecollection = self.get_collectionqueryset().get(id=filecollection_id)
        except TemporaryFileCollection.DoesNotExist:
            return

        for temporaryfile in temporaryfilecollection.files.all():
            print "creating commentfile for file: {}".format(temporaryfile.filename)
            groupcomment.add_commentfile_from_temporary_file(tempfile=temporaryfile)



