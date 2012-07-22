/**
 * Plugin for {@link devilry_subjectadmin.controller.managestudents.Overview} that
 * adds the ability to add students (groups with a single student) to an
 * assignment.
 */
Ext.define('devilry_subjectadmin.controller.managestudents.AddStudentsPlugin', {
    extend: 'Ext.app.Controller',

    views: [
        'managestudents.AddStudentsWindow',
    ],

    stores: [
        'RelatedStudentsRo',
        'RelatedExaminersRo',
        'Groups'
    ],

    refs: [{
        ref: 'addStudentsWindow',
        selector: 'addstudentswindow'
    }, {
        ref: 'selectedStudentsGrid',
        selector: 'addstudentswindow grid'
    }, {
        ref: 'automapExaminersCheckbox',
        selector: 'addstudentswindow #automapExaminersCheckbox'
    }],

    init: function() {
        this.application.addListener({
            scope: this,
            managestudentsSuccessfullyLoaded: this._onManageStudentsLoaded
        });
        this.control({
            'viewport managestudentsoverview button[itemId=addstudents]': {
                click: this._onAddstudents
            },
            'addstudentswindow #saveButton': {
                click: this._onSave
            },
            'addstudentswindow #allowDuplicatesCheckbox': {
                change: this._onAllowDuplicatesChange
            },
            'addstudentswindow #includeTagsCheckbox': {
                change: this._onIncludeTagsChange
            },
            'addstudentswindow #automapExaminersCheckbox': {
                change: this._onAutomapExaminersChange
            }
        });
    },

    _onManageStudentsLoaded: function(manageStudentsController) {
        this.manageStudentsController = manageStudentsController;
    },

    _onAddstudents: function() {
        var relatedStudentsStore = this.getRelatedStudentsRoStore();
        relatedStudentsStore.loadWithAutomaticErrorHandling({
            scope: this,
            success: this._onLoadRelatedStudentsStoreSuccess,
            errortitle: gettext('Failed to load students from the period')
        });
    },

    _onLoadRelatedStudentsStoreSuccess: function(records) {
        var relatedExaminersStore = this.getRelatedExaminersRoStore();
        relatedExaminersStore.loadWithAutomaticErrorHandling({
            scope: this,
            success: this._onLoad,
            errortitle: gettext('Failed to load examiners from the period')
        });
    },

    _onLoad: function() {
        this.relatedExaminersMappedByTag = this.getRelatedExaminersRoStore().getMappedByTags();
        var relatedStudentsStore = this.getRelatedStudentsRoStore();
        relatedStudentsStore.clearFilter();

        this._filterOutRelatedStudentsAlreadyInGroup();
        relatedStudentsStore.sortBySpecialSorter('full_name');
        Ext.widget('addstudentswindow', {
            relatedStudentsStore: relatedStudentsStore,
            periodinfo: this.manageStudentsController.getPeriodInfo(),
            relatedExaminersMappedByTag: this.relatedExaminersMappedByTag
        }).show();
    },

    _filterOutRelatedStudentsAlreadyInGroup: function() {
        var relatedStudentsStore = this.getRelatedStudentsRoStore();
        var currentUsers = this.getGroupsStore().getGroupsMappedByUserId();
        relatedStudentsStore.filterBy(function(relatedStudentRecord) {
            var userid = relatedStudentRecord.get('user').id;
            return typeof currentUsers[userid] == 'undefined';
        });
    },

    _onAllowDuplicatesChange: function(field, allowDuplicates) {
        if(allowDuplicates) {
            this.getRelatedStudentsRoStore().clearFilter();
        } else {
            this._filterOutRelatedStudentsAlreadyInGroup();
        }
        this.getAddStudentsWindow().refreshBody();
    },
    _onIncludeTagsChange: function(field, includeTags) {
        if(includeTags) {
            this.getAddStudentsWindow().refreshBody();
            this.getAutomapExaminersCheckbox().enable();
        } else {
            if(this.getAutomapExaminersCheckbox().getValue() == true) {
                this.getAutomapExaminersCheckbox().setValue(false);
                // NOTE: we do not refreshBody() because changing automapExaminersCheckbox will trigger it in _onAutomapExaminersChange()
            } else {
                this.getAddStudentsWindow().refreshBody();
            }
            this.getAutomapExaminersCheckbox().disable();
        }
    },
    _onAutomapExaminersChange: function() {
        this.getAddStudentsWindow().refreshBody();
    },

    _onSave: function(button) {
        var selModel = this.getSelectedStudentsGrid().getSelectionModel();
        var selectedRelatedStudents = selModel.getSelection();
        var groupsStore = this.getGroupsStore();
        var includeTags = true;
        var automapExaminers = true;

        Ext.Array.each(selectedRelatedStudents, function(relatedStudentRecord) {
            var groupRecord = groupsStore.addFromRelatedStudentRecord({
                relatedStudentRecord: relatedStudentRecord,
                includeTags: includeTags
            });
            if(automapExaminers) {
                groupRecord.setExaminersFromMapOfRelatedExaminers(this.relatedExaminersMappedByTag);
            }
        }, this);
        this.getAddStudentsWindow().close();
        this.manageStudentsController.notifyMultipleGroupsChange();
    }
});
