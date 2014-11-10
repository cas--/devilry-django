from collections import OrderedDict
import itertools
from datetime import datetime
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.views.generic.detail import DetailView

from devilry.apps.core.models import Assignment
from devilry_detektor.models import DetektorAssignment
from devilry_detektor.tasks import run_detektor_on_assignment
from devilry_detektor.comparer import DevilryDetektorCompareMany


class AssignmentAssemblyView(DetailView):
    model = Assignment
    pk_url_kwarg = 'assignmentid'
    context_object_name = 'assignment'
    template_name = 'devilry_detektor/admin/assignmentassembly.django.html'

    def get_queryset(self):
        return Assignment.objects.filter_admin_has_access(self.request.user)\
            .select_related(
                'parentnode', # Period
                'parentnode__parentnode') # Subject

    def get_object(self, *args, **kwargs):
        if not hasattr(self, '_assignment'):
            self._assignment = super(AssignmentAssemblyView, self).get_object(*args, **kwargs)
        return self._assignment

    def _get_detektorassignment(self):
        detektorassignment, created = DetektorAssignment.objects.get_or_create(
            assignment_id=self.get_object().id)
        return detektorassignment

    def get_success_url(self):
        return reverse('devilry_detektor_admin_assignmentassembly',
                       kwargs={'assignmentid': self.kwargs['assignmentid']})

    def post(self, *args, **kwargs):
        detektorassignment = self._get_detektorassignment()
        if detektorassignment.processing_started_datetime is None:
            detektorassignment.processing_started_datetime = datetime.now()
            detektorassignment.processing_started_by_id = self.request.user
            detektorassignment.save()
            run_detektor_on_assignment.delay(assignment_id=self.get_object().id)
        # NOTE: We ignore when the task is already running - this only occurs
        # when two admins click the button at the same time, and the message
        # shown is good enough for such an unlikely case.

        return HttpResponseRedirect(self.get_success_url())

    def _build_comparemany_results(self, detektorassignment):
        parseresults = detektorassignment.parseresults\
            .order_by('language')\
            .select_related(
                'delivery',
                'delivery__deadline',
                'delivery__deadline__assignment_group',
                'delivery__deadline__assignment_group__parentnode',  # Assignment
                'delivery__deadline__assignment_group__parentnode__parentnode',  # Period
                'delivery__deadline__assignment_group__parentnode__parentnode__parentnode'  # Subject
            )\
            .prefetch_related(
                'delivery__deadline__assignment_group__candidates',
                'delivery__deadline__assignment_group__candidates__student',
                'delivery__deadline__assignment_group__candidates__student__devilryuserprofile')
        bylanguage = OrderedDict()
        for language, parseresults in itertools.groupby(parseresults, lambda p: p.language):
            comparemany = DevilryDetektorCompareMany(list(parseresults))
            comparemany.sort_by_points_descending()
            bylanguage[language] = comparemany
        return bylanguage

    def get_context_data(self, **kwargs):
        context = super(AssignmentAssemblyView, self).get_context_data(**kwargs)
        detektorassignment = self._get_detektorassignment()
        context['comparemany_results_by_language'] = self._build_comparemany_results(detektorassignment)
        context['detektorassignment'] = detektorassignment
        return context
