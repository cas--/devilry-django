/** PrettyView for an assignment. */
Ext.define('devilry.administrator.assignment.PrettyView', {
    extend: 'devilry.administrator.PrettyView',
    alias: 'widget.administrator_assignmentprettyview',
    requires: [
        'devilry.extjshelpers.studentsmanager.StudentsManager',
        'devilry.extjshelpers.RestfulSimplifiedEditPanel',
        'devilry.extjshelpers.forms.administrator.AssignmentAdvanced',
        'devilry.extjshelpers.SingleRecordContainer',
        'devilry.gradeeditors.GradeEditorModel',
        'devilry.gradeeditors.RestfulRegistryItem',
        'devilry.gradeeditors.ConfigEditorWindow',
        'devilry.gradeeditors.GradeEditorSelectForm'
    ],

    config: {
        assignmentgroupstore: undefined
    },

    bodyTpl: Ext.create('Ext.XTemplate',
        '<section>',
        '    <tpl if="published">',
        '        <h1>Published</h1>',
        '        <p>',
        '           The assignment is currently visible to students and examiners. ',
        '           Its publishing time was <strong>{publishing_time:date}</strong>.',
        '        </p>',
        '    </tpl>',
        '    <tpl if="!published">',
        '        <section class="warning">',
        '             <h1>Not published</h1>',
        '             <p>',
        '                This assignment is currently <em>not visible</em> to students or examiners. ',
        '                The assignment will become visible to students and examiners ',
        '                <strong>{publishing_time:date}</strong>.',
        '             </p>',
        '        </section>',
        '    </tpl>',
        '    <tpl if="must_pass">',
        '       <h1>Must pass</h1>',
        '       <p>',
        '           Each students are <em>required</em> to get a passsing grade ',
        '           on this assigmment to pass the <em>period</em>. This requirement ',
        '           is only active for students registered on groups on this assignment.',
        '       </p>',
        '    </tpl>',
        '    <tpl if="anonymous">',
        '       <h1>Anonymous</h1>',
        '       <p>',
        '           The assignment <em>is anonymous</em>. This means that examiners ',
        '           see the <em>candidate ID</em> instead of user name and ',
        '           email. Furthermore, students do not see who their examiner(s)',
        '           are.',
        '       </p>',
        '    </tpl>',
        '    <tpl if="!anonymous">',
        '       <h1>Not anonymous</h1>',
        '       <p>',
        '           The assignment is <em>not</em> anonymous. This means that examiners ',
        '           can see information about who their students are. ',
        '           Furthermore, students can see who their examiner(s)',
        '           are.',
        '       </p>',
        '    </tpl>',
        '</section>'
    ),

    constructor: function(config) {
        this.callParent([config]);
        this.initConfig(config);
    },

    getExtraBodyData: function(record) {
        return {
            published: record.data.publishing_time < Ext.Date.now(),
        };
    },

    initComponent: function() {
        this.gradeeditorconfig_recordcontainer = Ext.create('devilry.extjshelpers.SingleRecordContainer');
        this.gradeeditorconfig_recordcontainer.addListener('setRecord', this.onGradeEditorConfigLoad, this);

        this.gradeeditor_registryitem_recordcontainer= Ext.create('devilry.extjshelpers.SingleRecordContainer');
        this.gradeeditor_registryitem_recordcontainer.addListener('setRecord', this.onGradeEditorRegistryItemLoad, this);

        if(this.record) {
            this.onLoadRecord();
        } else {
            this.addListener('loadmodel', this.onLoadRecord, this);
        }

        this.studentsbutton = Ext.create('Ext.button.Button', {
            text: 'Students',
            scale: 'medium',
            listeners: {
                scope: this,
                click: this.onStudents
            }
        });

        this.advancedbutton = Ext.create('Ext.button.Button', {
            text: 'Advanced options',
            scale: 'medium',
            menu: [],
            listeners: {
                scope: this,
                click: this.onAdvanced
            }
        });

        this.selectgradeeditorbutton = Ext.create('Ext.button.Button', {
            text: 'Select grade editor',
            scale: 'medium',
            menu: [],
            listeners: {
                scope: this,
                click: this.onSelectGradeEditorBtn,
                render: function(button) {
                    if(!this.gradeeditorconfig_recordcontainer.record) {
                        button.getEl().mask('Loading');
                    }
                }
            }
        });

        this.configuregradeeditorbutton = Ext.create('Ext.button.Button', {
            text: 'Configure grade editor',
            scale: 'medium',
            disabled: true,
            listeners: {
                scope: this,
                click: this.onConfigureGradeEditorBtn,
                render: function(button) {
                    if(!this.gradeeditorconfig_recordcontainer.record) {
                        button.getEl().mask('Loading');
                    }
                }
            }
        });

        Ext.apply(this, {
            relatedButtons: [this.studentsbutton],
            extraMeButtons: [this.selectgradeeditorbutton, this.configuregradeeditorbutton, this.advancedbutton],
        });
        this.callParent(arguments);
    },

    onLoadRecord: function() {
        Ext.ModelManager.getModel('devilry.apps.gradeeditors.simplified.administrator.SimplifiedConfig').load(this.record.data.id, {
            scope: this,
            success: function(record) {
                this.gradeeditorconfig_recordcontainer.setRecord(record);
            },
            failure: function() {
                var record = Ext.create('devilry.apps.gradeeditors.simplified.administrator.SimplifiedConfig', {
                    assignment: this.record.data.id
                });
                this.gradeeditorconfig_recordcontainer.setRecord(record);
            }
        });
    },

    onGradeEditorConfigLoad: function() {
        if(this.selectgradeeditorbutton.rendered) {
            this.selectgradeeditorbutton.getEl().unmask();
        }
        this.loadGradeEditorRegistryItem();
    },

    loadGradeEditorRegistryItem: function() {
        var registryitem_model = Ext.ModelManager.getModel('devilry.gradeeditors.RestfulRegistryItem');
        this.configuregradeeditorbutton.getEl().mask('Loading');
        registryitem_model.load(this.gradeeditorconfig_recordcontainer.record.data.gradeeditorid, {
            scope: this,
            success: function(record) {
                this.gradeeditor_registryitem_recordcontainer.setRecord(record);
            }
        });
    },

    onGradeEditorRegistryItemLoad: function() {
        this.configuregradeeditorbutton.getEl().unmask();
        if(this.gradeeditor_registryitem_recordcontainer.record.data.config_editor_url) {
            this.configuregradeeditorbutton.enable();
        }
    },

    onSelectGradeEditorBtn: function(button) {
        var editpanel = Ext.ComponentManager.create({
            xtype: 'restfulsimplified_editpanel',
            model: 'devilry.apps.gradeeditors.simplified.administrator.SimplifiedConfig',
            editform: Ext.widget('gradeeditorselectform'),
            record: this.gradeeditorconfig_recordcontainer.record,
            extrabaronbottom: true
        });
        var me = this;
        var editwindow = Ext.create('devilry.extjshelpers.RestfulSimplifiedEditWindowBase', {
            editpanel: editpanel,
            onSaveSuccess: function(record) {
                me.gradeeditorconfig_recordcontainer.setRecord(record);
                this.close();
            }
        });
        editwindow.show();
        editwindow.alignTo(this.selectgradeeditorbutton, 'br', [-editwindow.getWidth(), 0]);
    },

    onConfigureGradeEditorBtn: function(button) {
        Ext.widget('gradeconfigeditormainwin', {
            registryitem: this.gradeeditor_registryitem_recordcontainer.record.data,
            gradeeditorconfig_recordcontainer: this.gradeeditorconfig_recordcontainer
        }).show();
    },

    onAdvanced: function(button) {
        var editpanel = Ext.ComponentManager.create({
            xtype: 'restfulsimplified_editpanel',
            model: this.modelname,
            editform: Ext.widget('administrator_assignmentadvancedform'),
            record: this.record
        });
        var editwindow = Ext.create('devilry.administrator.DefaultEditWindow', {
            editpanel: editpanel,
            prettyview: this
        });
        editwindow.show();
        editwindow.alignTo(button, 'br', [-editwindow.getWidth(), 0]);
    },

    onStudents: function() {
        if(!this.studentswindow) {
            this.studentswindow = Ext.create('Ext.window.Window', {
                title: 'Students',
                width: 800,
                height: 600,
                layout: 'fit',
                maximizable: true,
                //maximized: true,
                closeAction: 'hide',
                items: {
                    xtype: 'studentsmanager',
                    assignmentgroupstore: this.assignmentgroupstore,
                    assignmentid: this.objectid
                },
            });
        }
        this.studentswindow.show();
    }
});
