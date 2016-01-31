import unittest

import htmls
import mock
from django.conf import settings
from django.contrib import messages
from django.http import Http404
from django.test import TestCase, RequestFactory
from django_cradmin import cradmin_testhelpers
from model_mommy import mommy

from devilry.apps.core.models import RelatedStudent
from devilry.devilry_admin.tests.common.test_bulkimport_users_common import AbstractTypeInUsersViewTestMixin
from devilry.devilry_admin.views.period import students
from devilry.project.develop.testhelpers.corebuilder import PeriodBuilder, UserBuilder2


@unittest.skip('Must be updated to listbuilder')
class TestListView(TestCase):
    def __mock_get_request(self, role, user):
        request = RequestFactory().get('/')
        request.user = user
        request.cradmin_role = role
        request.cradmin_app = mock.MagicMock()
        request.cradmin_instance = mock.MagicMock()
        request.session = mock.MagicMock()
        response = students.ListView.as_view()(request)
        return response

    def mock_http200_getrequest_htmls(self, role, user):
        response = self.__mock_get_request(role=role, user=user)
        self.assertEqual(response.status_code, 200)
        response.render()
        selector = htmls.S(response.content)
        return selector

    def __get_shortnames(self, selector):
        return [element.alltext_normalized
                for element in selector.list('.devilry-user-verbose-inline-shortname')]

    def __get_names(self, selector):
        return [element.alltext_normalized
                for element in selector.list('.devilry-user-verbose-inline')]

    def test_title(self):
        testuser = UserBuilder2().user
        subjectbuilder = PeriodBuilder.make(long_name='The Long Name') \
            .add_relatedstudents(testuser)
        selector = self.mock_http200_getrequest_htmls(role=subjectbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(selector.one('title').alltext_normalized,
                         'Students')

    def test_no_students_messages(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make()
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(selector.one('#objecttableview-no-items-message').alltext_normalized,
                         'There is no students registered for {}.'.format(
                             periodbuilder.get_object().get_path()))

    def test_ordering(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='userb').user,
                                 UserBuilder2(shortname='usera').user,
                                 UserBuilder2(shortname='userc').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(['usera', 'userb', 'userc'], self.__get_shortnames(selector))

    def test_render_user_with_fullname(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='test', fullname='Test User').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(['Test User(test)'], self.__get_names(selector))

    def test_render_user_without_fullname(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='test').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(['test'], self.__get_names(selector))

    def test_render_email_has_primary_email(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='test').add_primary_email('test@example.com').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(selector.one('.devilry-admin-adminlist-email').alltext_normalized,
                         'Contact at test@example.com')
        self.assertEqual(selector.one('.devilry-admin-adminlist-email')['href'],
                         'mailto:test@example.com')

    def test_render_email_no_primary_email(self):
        testuser = UserBuilder2(is_superuser=True).user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='test').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertFalse(selector.exists('.devilry-admin-adminlist-email')),

    def test_render_only_users_from_current_basenode(self):
        testuser = UserBuilder2(is_superuser=True).user
        PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='otherbasenodeuser').user)
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(UserBuilder2(shortname='expecteduser').user)
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertEqual(['expecteduser'], self.__get_names(selector))


class TestDeactivateStudentView(TestCase, cradmin_testhelpers.TestCaseMixin):
    viewclass = students.DeactivateView

    def test_get_title(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period',
                                parentnode__short_name='testsubject',
                                short_name='testperiod')
        relatedstudent = mommy.make('core.RelatedStudent',
                                    period=testperiod,
                                    user__fullname='Jane Doe')
        mockresponse = self.mock_http200_getrequest_htmls(
                cradmin_role=testperiod,
                requestuser=requestuser,
                viewkwargs={'pk': relatedstudent.pk})
        self.assertEqual(mockresponse.selector.one('title').alltext_normalized,
                         'Deactivate student: Jane Doe')

    def test_get_h1(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period',
                                parentnode__short_name='testsubject',
                                short_name='testperiod')
        relatedstudent = mommy.make('core.RelatedStudent',
                                    period=testperiod,
                                    user__fullname='Jane Doe')
        mockresponse = self.mock_http200_getrequest_htmls(
                cradmin_role=testperiod,
                requestuser=requestuser,
                viewkwargs={'pk': relatedstudent.pk})
        self.assertEqual(mockresponse.selector.one('h1').alltext_normalized,
                         'Deactivate student: Jane Doe')

    def test_get_preview(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period',
                                parentnode__short_name='testsubject',
                                short_name='testperiod')
        relatedstudent = mommy.make('core.RelatedStudent',
                                    period=testperiod,
                                    user__fullname='Jane Doe')
        mockresponse = self.mock_http200_getrequest_htmls(
                cradmin_role=testperiod,
                requestuser=requestuser,
                viewkwargs={'pk': relatedstudent.pk})
        self.assertEqual(mockresponse.selector.one('#deleteview-preview').alltext_normalized,
                         'Are you sure you want to make Jane Doe '
                         'an inactive student for testsubject.testperiod? Inactive students '
                         'can not be added to new assignments, but they still have access '
                         'to assignments that they have already been granted access to. Inactive '
                         'students are clearly marked with warning messages throughout the student, examiner '
                         'and admin UI, but students and examiners are not notified in any way when you '
                         'deactivate a student. You can re-activate a deactivated student at any time.')

    def test_404_if_not_relatedstudent_on_period(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period')
        otherperiod = mommy.make('core.Period')
        relatedstudent = mommy.make('core.RelatedStudent',
                                    period=otherperiod)
        with self.assertRaises(Http404):
            self.mock_getrequest(
                    cradmin_role=testperiod,
                    requestuser=requestuser,
                    viewkwargs={'pk': relatedstudent.pk})

    def test_post_deactivates(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period')
        relatedstudent = mommy.make('core.RelatedStudent', period=testperiod)
        self.assertTrue(relatedstudent.active)
        self.mock_http302_postrequest(
                cradmin_role=testperiod,
                requestuser=requestuser,
                viewkwargs={'pk': relatedstudent.pk})
        updated_relatedstudent = RelatedStudent.objects.get(id=relatedstudent.id)
        self.assertFalse(updated_relatedstudent.active)

    def test_post_success_message(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        testperiod = mommy.make('core.Period')
        relatedstudent = mommy.make('core.RelatedStudent',
                                    period=testperiod,
                                    user__fullname='Jane Doe')
        self.assertTrue(relatedstudent.active)
        messagesmock = mock.MagicMock()
        self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestuser=requestuser,
                viewkwargs={'pk': relatedstudent.pk})
        messagesmock.add.assert_called_once_with(
            messages.SUCCESS,
            'Jane Doe was deactivated.',
            '')


class TestUserSelectView(TestCase):
    def __mock_get_request(self, role, user):
        request = RequestFactory().get('/')
        request.user = user
        request.cradmin_role = role
        request.cradmin_app = mock.MagicMock()
        request.cradmin_instance = mock.MagicMock()
        request.session = mock.MagicMock()
        response = students.UserSelectView.as_view()(request)
        return response

    def mock_http200_getrequest_htmls(self, role, user):
        response = self.__mock_get_request(role=role, user=user)
        self.assertEqual(response.status_code, 200)
        response.render()
        selector = htmls.S(response.content)
        return selector

    def test_render(self):
        testuser = UserBuilder2().user
        periodbuilder = PeriodBuilder.make() \
            .add_relatedstudents(testuser)  # testuser should be excluded since it is already student
        UserBuilder2(shortname='Jane Doe')
        selector = self.mock_http200_getrequest_htmls(role=periodbuilder.get_object(),
                                                      user=testuser)
        self.assertTrue(selector.exists(
            '#objecttableview-table tbody .devilry-admin-userselect-select-button'))
        self.assertEqual(
            selector.one('#objecttableview-table tbody '
                         '.devilry-admin-userselect-select-button').alltext_normalized,
            'Add as student')


class TestAddView(TestCase):
    def __mock_postrequest(self, role, requestuser, data, messagesmock=None):
        request = RequestFactory().post('/', data=data)
        request.user = requestuser
        request.cradmin_role = role
        request.cradmin_app = mock.MagicMock()
        request.cradmin_instance = mock.MagicMock()
        request.session = mock.MagicMock()
        if messagesmock:
            request._messages = messagesmock
        else:
            request._messages = mock.MagicMock()
        response = students.AddView.as_view()(request)
        return response, request

    def test_invalid_user(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        periodbuilder = PeriodBuilder.make(short_name='testbasenode')
        response, request = self.__mock_postrequest(role=periodbuilder.get_object(),
                                                    requestuser=requestuser,
                                                    data={'user': 10000000001})
        self.assertEqual(response.status_code, 302)
        request._messages.add.assert_called_once_with(
            messages.ERROR,
            'Error: The user may not exist, or it may already be student.', '')
        request.cradmin_app.reverse_appindexurl.assert_called_once()

    def test_user_already_student(self):
        # Just to ensure the ID of the RelatedStudent does not match
        # the ID of the User
        UserBuilder2()
        UserBuilder2()
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        periodbuilder = PeriodBuilder.make(short_name='testbasenode') \
            .add_relatedstudents(requestuser)
        response, request = self.__mock_postrequest(role=periodbuilder.get_object(),
                                                    requestuser=requestuser,
                                                    data={'user': requestuser.id})
        self.assertEqual(response.status_code, 302)
        request._messages.add.assert_called_once_with(
            messages.ERROR,
            'Error: The user may not exist, or it may already be student.', '')
        request.cradmin_app.reverse_appindexurl.assert_called_once()

    def test_adds_user_to_relatedstudents(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        janedoe = UserBuilder2().user
        periodbuilder = PeriodBuilder.make()
        self.assertFalse(periodbuilder.get_object().relatedstudent_set.filter(user=janedoe).exists())
        self.__mock_postrequest(role=periodbuilder.get_object(),
                                requestuser=requestuser,
                                data={'user': janedoe.id})
        self.assertTrue(periodbuilder.get_object().relatedstudent_set.filter(user=janedoe).exists())

    def test_success_message(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        janedoe = UserBuilder2(fullname='Jane Doe').user
        periodbuilder = PeriodBuilder.make(short_name='testbasenode')
        response, request = self.__mock_postrequest(role=periodbuilder.get_object(),
                                                    requestuser=requestuser,
                                                    data={'user': janedoe.id})
        request._messages.add.assert_called_once_with(
            messages.SUCCESS,
            'Jane Doe added as student for {}.'.format(periodbuilder.get_object()),
            '')

    def test_success_redirect_without_next(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        janedoe = UserBuilder2(fullname='Jane Doe').user
        periodbuilder = PeriodBuilder.make(short_name='testbasenode')
        response, request = self.__mock_postrequest(role=periodbuilder.get_object(),
                                                    requestuser=requestuser,
                                                    data={'user': janedoe.id})
        self.assertEqual(response.status_code, 302)
        request.cradmin_app.reverse_appindexurl.assert_called_once()

    def test_success_redirect_with_next(self):
        requestuser = mommy.make(settings.AUTH_USER_MODEL)
        janedoe = UserBuilder2(fullname='Jane Doe').user
        periodbuilder = PeriodBuilder.make(short_name='testbasenode')
        response, request = self.__mock_postrequest(role=periodbuilder.get_object(),
                                                    requestuser=requestuser,
                                                    data={'user': janedoe.id,
                                                          'next': '/next'})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response['location'], '/next')


class TestBulkImportView(TestCase, AbstractTypeInUsersViewTestMixin):
    viewclass = students.BulkImportView

    def test_post_valid_with_email_backend_creates_relatedusers(self):
        testperiod = mommy.make('core.Period')
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=True):
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                requestkwargs=dict(data={
                    'users_blob': 'test1@example.com\ntest2@example.com'
                })
            )
            self.assertEqual(2, RelatedStudent.objects.count())
            self.assertEqual({'test1@example.com', 'test2@example.com'},
                             {relatedstudent.user.shortname
                              for relatedstudent in RelatedStudent.objects.all()})

    def test_post_valid_with_email_backend_added_message(self):
        testperiod = mommy.make('core.Period')
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=True):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test1@example.com\ntest2@example.com'
                })
            )
            messagesmock.add.assert_any_call(
                messages.SUCCESS,
                'Added 2 new students to {}.'.format(testperiod.get_path()),
                '')

    def test_post_valid_with_email_backend_none_added_message(self):
        testperiod = mommy.make('core.Period')
        testuser = mommy.make(settings.AUTH_USER_MODEL)
        mommy.make('devilry_account.UserEmail',
                   user=testuser,
                   email='test@example.com')
        mommy.make('core.RelatedStudent',
                   period=testperiod,
                   user=testuser)
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=True):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test@example.com'
                })
            )
            messagesmock.add.assert_any_call(
                messages.WARNING,
                'No new students was added.',
                '')

    def test_post_valid_with_email_backend_existing_message(self):
        testperiod = mommy.make('core.Period')
        testuser = mommy.make(settings.AUTH_USER_MODEL)
        mommy.make('devilry_account.UserEmail',
                   user=testuser,
                   email='test@example.com')
        mommy.make('core.RelatedStudent',
                   period=testperiod,
                   user=testuser)
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=True):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test@example.com'
                })
            )
            messagesmock.add.assert_called_with(
                messages.INFO,
                '1 users was already student on {}.'.format(testperiod.get_path()),
                '')

    def test_post_valid_with_username_backend_creates_relatedusers(self):
        testperiod = mommy.make('core.Period')
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=False):
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                requestkwargs=dict(data={
                    'users_blob': 'test1\ntest2'
                })
            )
            self.assertEqual(2, RelatedStudent.objects.count())
            self.assertEqual({'test1', 'test2'},
                             {relatedstudent.user.shortname
                              for relatedstudent in RelatedStudent.objects.all()})

    def test_post_valid_with_username_backend_added_message(self):
        testperiod = mommy.make('core.Period')
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=False):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test1\ntest2'
                })
            )
            messagesmock.add.assert_any_call(
                messages.SUCCESS,
                'Added 2 new students to {}.'.format(testperiod.get_path()),
                '')

    def test_post_valid_with_username_backend_none_added_message(self):
        testperiod = mommy.make('core.Period')
        testuser = mommy.make(settings.AUTH_USER_MODEL)
        mommy.make('devilry_account.UserName',
                   user=testuser,
                   username='test')
        mommy.make('core.RelatedStudent',
                   period=testperiod,
                   user=testuser)
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=False):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test'
                })
            )
            messagesmock.add.assert_any_call(
                messages.WARNING,
                'No new students was added.',
                '')

    def test_post_valid_with_username_backend_existing_message(self):
        testperiod = mommy.make('core.Period')
        testuser = mommy.make(settings.AUTH_USER_MODEL)
        mommy.make('devilry_account.UserName',
                   user=testuser,
                   username='test')
        mommy.make('core.RelatedStudent',
                   period=testperiod,
                   user=testuser)
        with self.settings(DJANGO_CRADMIN_USE_EMAIL_AUTH_BACKEND=False):
            messagesmock = mock.MagicMock()
            self.mock_http302_postrequest(
                cradmin_role=testperiod,
                messagesmock=messagesmock,
                requestkwargs=dict(data={
                    'users_blob': 'test'
                })
            )
            messagesmock.add.assert_any_call(
                messages.INFO,
                '1 users was already student on {}.'.format(testperiod.get_path()),
                '')
