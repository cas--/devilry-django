from django.template.loader import render_to_string
from django_cradmin.viewhelpers import listbuilder


class ItemValueMixin(object):
    valuealias = 'period'

    def get_title(self):
        return self.period.long_name

    def get_description(self):
        return render_to_string('devilry_cradmin/devilry_listbuilder/period/description.django.html',
                                self.get_context_data())


class ItemValue(ItemValueMixin, listbuilder.itemvalue.TitleDescription):
    """
    ItemValue renderer for a single period.

    This is a base class that does not contain any role specific data.
    """
