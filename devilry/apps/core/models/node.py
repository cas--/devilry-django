from django.utils.translation import ugettext as _
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth.models import User
from django.db import models

from basenode import BaseNode
from custom_db_fields import ShortNameField, LongNameField

class Node(models.Model, BaseNode):
    """
    This class is typically used to represent a hierarchy of institutions, 
    faculties and departments.


    .. attribute:: parentnode

        A django.db.models.ForeignKey_ that points to the parent node, which
        is always a `Node`_.

    .. attribute:: admins

        A django.db.models.ManyToManyField_ that holds all the admins of the
        `Node`_.

    .. attribute:: child_nodes

        A set of child_nodes for this node
 
    .. attribute:: subjects

        A set of subjects for this node 
    """
    short_name = ShortNameField()
    long_name = LongNameField()
    parentnode = models.ForeignKey('self', blank=True, null=True, related_name='child_nodes')
    admins = models.ManyToManyField(User, blank=True)

    class Meta:
        app_label = 'core'
        verbose_name = _('Node')
        verbose_name_plural = _('Nodes')
        unique_together = ('short_name', 'parentnode')
        ordering = ['short_name']

    def _can_save_id_none(self, user_obj):
        if self.parentnode != None and self.parentnode.is_admin(user_obj):
            return True
        else:
            return False

    def get_path(self):
        if self.parentnode:
            return self.parentnode.get_path() + "." + self.short_name
        else:
            return self.short_name

    def get_full_path(self):
        return self.get_path()
    get_full_path.short_description = BaseNode.get_full_path.short_description
    
    def iter_childnodes(self):
        """
        Recursively iterates over all child nodes, and their child nodes.
        For a list of direct child nodes, use atribute child_nodes instead.
        """
        for node in Node.objects.filter(parentnode=self):
            yield node
            for c in node.iter_childnodes():
                yield c

    def clean(self, *args, **kwargs):
        """Validate the node, making sure it does not do something stupid.

        Always call this before save()! Read about validation here:
        http://docs.djangoproject.com/en/dev/ref/models/instances/#id1

        Raises ValidationError if:

            - The node is it's own parent.
            - The node is the child of itself or one of its childnodes.
        """
        if self.parentnode == self:
            raise ValidationError(_('A node can not be it\'s own parent.'))

        if not self.short_name:
            raise ValidationError(_('Short Name is a required attribute.'))

        greater_than_count = 1
        if self.id == None:
            greater_than_count = 0
            
        if self.parentnode:
            if Node.objects.filter(short_name=self.short_name).\
                   filter(parentnode__pk=self.parentnode.id).count() > greater_than_count:
                raise ValidationError(_('A node can not have the same '\
                                        'short name as another within the same parent.'))
        else:
            if Node.objects.filter(short_name=self.short_name).\
                   filter(parentnode=None).count() > greater_than_count:
                raise ValidationError(_('A root node can not have the same '\
                                        'short name as another root node.'))
        for node in self.iter_childnodes():
            if node == self.parentnode:
                raise ValidationError(_('A node can not be the child of one of it\'s own children.'))
        super(Node, self).clean(*args, **kwargs)

    @classmethod
    def _get_nodepks_where_isadmin(cls, user_obj):
        """ Get a list with the primary key of all nodes where the given
        `user_obj` is admin. """
        admnodes = Node.objects.filter(admins=user_obj)
        l = []
        def add_admnodes(admnodes):
            for a in admnodes.all():
                l.append(a.pk)
                add_admnodes(a.child_nodes)
        add_admnodes(admnodes)
        return l

    @classmethod
    def q_is_admin(cls, user_obj):
        return Q(pk__in=cls._get_nodepks_where_isadmin(user_obj))

    @classmethod
    def get_by_path_kw(cls, pathlist):
        """ Used by :meth:`get_by_path` to create the required kwargs for
        Node.objects.get(). Might be a starting point for more sophisticated
        queries including paths. Example::

            ifi = Node.objects.get(**Node.get_by_path_kw(['uio', 'ifi']))

        :param pathlist: A list of node-names, like ``['uio', 'ifi']``.
        """
        kw = {}
        key = 'short_name'
        for short_name in reversed(pathlist):
            kw[key] = short_name
            key = 'parentnode__' + key
        return kw

    @classmethod
    def get_by_path(cls, path):
        """ Get a node by path.

        Raises :exc:`Node.DoesNotExist` if the query does not match.
        
        :param path: The path to a Node, like ``'uio.ifi'``.
        :type path: str
        :return: A Node-object.
        """
        return Node.objects.get(**Node.get_by_path_kw(path.split('.')))
