Ext.define('devilry.gradeeditors.DraftEditorWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.gradedrafteditormainwin',
    title: 'Create feedback',
    width: 800,
    height: 600,
    layout: 'fit',
    modal: true,
    requires: [
        'devilry.extjshelpers.NotificationManager'
    ],

    config: {
        /**
         * @cfg
         * ID of the Delivery where the feedback belongs. (Required).
         */
        deliveryid: undefined,

        /**
         * @cfg
         * Use the administrator RESTful interface to store drafts? If this is
         * ``false``, we use the examiner RESTful interface.
         */
        isAdministrator: false,

        /**
         * @cfg
         * The data attribute of the record returned when loading the
         * grade-editor config. (Required).
         */
        gradeeditor_config: undefined,

        /**
         * @cfg
         * The data attribute of the record returned when loading the
         * grade-editor registry item. (Required).
         */
        registryitem: undefined
    },

    constructor: function(config) {
        this.initConfig(config);
        this.callParent([config]);
        this.addEvents('publishNewFeedback');
    },

    initComponent: function() {
        Ext.apply(this, {
            items: {
                xtype: 'panel',
                frame: false,
                border: false,
                layout: 'fit',
                loader: {
                    url: this.registryitem.draft_editor_url,
                    renderer: 'component',
                    autoLoad: true,
                    loadMask: true,
                    scope: this, // for success and failure
                    success: this.onLoadDraftEditorSuccess,
                    failure: this.onLoadDraftEditorFailure
                }
            }
        });
        this.initComponentExtra();
        this.callParent(arguments);
    },

    initComponentExtra: function() {
        this.draftButton = Ext.widget('button', {
            text: 'Save draft',
            scale: 'large',
            iconCls: 'icon-save-32',
            listeners: {
                scope: this,
                click: this.onSaveDraft,
            }
        });

        this.publishButton = Ext.widget('button', {
            text: 'Publish',
            scale: 'large',
            iconCls: 'icon-add-32',
            listeners: {
                scope: this,
                click: this.onPublish
            }
        });

        Ext.apply(this, {
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                items: ['->', this.draftButton, this.publishButton]
            }]
        });
    },

    /**
     * @private
     */
    getSimplifiedFeedbackDraftModelName: function() {
        return Ext.String.format(
            'devilry.apps.gradeeditors.simplified.{0}.SimplifiedFeedbackDraft',
            this.isAdministrator? 'administrator': 'examiner'
        );
    },

    /**
     * @private
     */
    onLoadDraftEditorSuccess: function() {
        this.getDraftEditor().getEl().mask('Loading current draft');

        var store = Ext.create('Ext.data.Store', {
            model: this.getSimplifiedFeedbackDraftModelName(),
            remoteFilter: true,
            remoteSort: true,
            autoSync: true

        });

        store.proxy.extraParams.filters = Ext.JSON.encode({
            field: 'delivery',
            comp: 'exact',
            value: this.deliveryid
        });
        store.proxy.extraParams.orderby = Ext.JSON.encode(['-save_timestamp']);
        store.pageSize = 1;
        store.load({
            scope: this,
            callback: this.onLoadCurrentDraft
        });
    },

    /**
     * @private
     */
    onLoadDraftEditorFailure: function(elementloader, response) {
        console.error(Ext.String.format(
            'Loading grade editor failed with {0}: {1}',
            response.status, response.statusText
        ));
        if(response.status === 404) {
            console.error('Status code 404 indicates that the draft_editor_url is invalid.');
        } else if(response.status === 200) {
            console.error('Status code 200 indicates that the draft_editor_url contains javascript with syntax errors.');
        }
        console.error('Complete response object:');
        console.error(response);
    },

    /**
     * @private
     */
    onLoadCurrentDraft: function(records, operation, successful) {
        if(successful) {
            var draftstring = undefined;
            if(records.length !== 0) {
                draftstring = records[0].data.draft;
            }
            this.initializeDraftEditor(draftstring);
        } else {
            throw "Failed to load current draft."
        }
    },

    /**
     * @private
     * @param draftstring May be undefined.
     */
    initializeDraftEditor: function(draftstring) {
        this.getDraftEditor().initializeEditor(this.getGradeEditorConfig());
        this.getDraftEditor().setDraftstring(draftstring);
    },

    /**
     * @private
     * Get the draft editor.
     */
    getDraftEditor: function() {
        return this.getComponent(0).getComponent(0);
    },

    /**
     * @private
     * Call the onPublish() method in the draft editor.
     */
    onPublish: function() {
        this.publishButton.getEl().mask('');
        this.getDraftEditor().onPublish();
    },

    /**
     * @private
     * Call the onSaveDraft() method in the draft editor.
     */
    onSaveDraft: function() {
        this.draftButton.getEl().mask('');
        this.getDraftEditor().onSaveDraft();
    },

    /**
     * @private
     * Exit the grade editor.
     */
    exit: function() {
        this.close();
    },

    /**
     * @private
     */
    save: function(published, draftstring, saveconfig) {
        var draftrecord = Ext.create(this.getSimplifiedFeedbackDraftModelName(), {
            draft: draftstring,
            published: published,
            delivery: this.deliveryid
        });
        draftrecord.save(saveconfig);
    },

    /**
     * Save the current draftstring.
     *
     * @param draftstring The draftstring to save.
     * @param onFailure Called when the save fails. The scope is the draft
     *    editor that ``saveDraft`` was called from.
     */
    saveDraft: function(draftstring, onFailure) {
        var me = this;
        this.save(false, draftstring, {
            scope: this.getDraftEditor(),
            callback: function() {
                me.draftButton.getEl().unmask();
            },
            failure: onFailure,
            success: function(response) {
                devilry.extjshelpers.NotificationManager.show({
                    title: 'Draft saved',
                    message: 'The feedback draft has been saved.'
                });
            },
        });
    },

    /**
     * Save and publish draftstring.
     *
     * @param draftstring The draftstring to save.
     * @param onFailure Called when the save fails. The scope is the draft
     *    editor that ``saveDraft`` was called from.
     */
    saveDraftAndPublish: function(draftstring, onFailure) {
        var me = this;
        this.save(true, draftstring, {
            scope: this.getDraftEditor(),
            callback: function() {
                me.publishButton.getEl().unmask();
            },
            success: function(response) {
                me.fireEvent('publishNewFeedback');
                me.exit();
                devilry.extjshelpers.NotificationManager.show({
                    title: 'Published',
                    message: 'The feedback has been saved and published.'
                });
            },
            failure: onFailure
        });
    },

    /**
     * Get the grade editor configuration that is stored on the current
     * assignment.
     */
    getGradeEditorConfig: function() {
        return this.gradeeditor_config;
    },

    /**
     * Change the size of the grade editor window. Useful when the default size is
     * suboptimal for an editor.
     *
     * @param width New width.
     * @param height Ne height.
     * */
    changeSize: function(width, height) {
        this.setWidth(width);
        this.setHeight(height);
        this.center();
    }
});
