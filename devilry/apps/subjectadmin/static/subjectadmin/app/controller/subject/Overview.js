/**
 * Controller for the subject overview.
 */
Ext.define('subjectadmin.controller.subject.Overview', {
    extend: 'Ext.app.Controller',

    views: [
        'subject.Overview',
        'ActionList'
    ],

    stores: [
        'Subjects'
    ],

    refs: [{
        ref: 'globalAlertmessagelist',
        selector: 'subjectoverview>alertmessagelist'
    }, {
        ref: 'actions',
        selector: 'subjectoverview #actions'
    }, {
        ref: 'subjectOverview',
        selector: 'subjectoverview'
    }],

    init: function() {
        this.control({
            'viewport subjectoverview': {
                render: this._onSubjectViewRender
            },
            'viewport subjectoverview editablesidebarbox[itemId=gradeeditor] button': {
                click: this._onEditGradeEditor
            }
        });
    },

    _onSubjectViewRender: function() {
        this.subject_shortname = this.getSubjectOverview().subject_shortname;
        this._loadSubject();
    },

    _loadSubject: function() {
        this.getSubjectsStore().loadSubject(
            this.subject_shortname, this._onLoadSubject, this
        );
    },

    _onLoadSubject: function(records, operation) {
        if(operation.success) {
            this._onLoadSubjectSuccess(records[0]);
        } else {
            this._onLoadSubjectFailure(operation);
        }
    },

    _onLoadSubjectFailure: function(operation) {
        var error = Ext.create('themebase.RestfulApiProxyErrorHandler', operation);
        error.addErrors(operation);
        this.getGlobalAlertmessagelist().addMany(error.errormessages, 'error');
    },

    _onLoadSubjectSuccess: function(record) {
        this.assignmentRecord = record;
        this.getActions().setTitle(record.get('long_name'));
    },
});
