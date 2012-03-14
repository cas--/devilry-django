/**
 * Controller for the list of all subjects.
 */
Ext.define('subjectadmin.controller.subject.ListAll', {
    extend: 'Ext.app.Controller',

    requires: [
        'themebase.RestfulApiProxyErrorHandler'
    ],
    views: [
        'subject.ListAll'
    ],
    stores: [
        'Subjects'
    ],

    refs: [{
        ref: 'subjectList',
        selector: 'subjectlistall #subjectList'
    }],

    init: function() {
        this.control({
            'viewport subjectlistall': {
                render: this._onRender
            }
        });
    },

    _onRender: function() {
        this.getSubjectsStore().loadAll({
            scope: this,
            callback: this._onLoadSubjects
        });
    },

    _onLoadSubjects: function(records, operation) {
        if(!operation.wasSuccessful()) {
            var error = Ext.create('themebase.RestfulApiProxyErrorHandler', operation);
            error.addErrors(operation);
            this.application.showErrorView({
                message: error.errormessages.join(' ')
            });
        }
    }
});
