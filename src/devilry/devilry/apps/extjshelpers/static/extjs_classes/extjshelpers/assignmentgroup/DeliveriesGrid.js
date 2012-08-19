Ext.define('devilry.extjshelpers.assignmentgroup.DeliveriesGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.deliveriesgrid',
    cls: 'widget-deliveriesgrid selectable-grid',
    hideHeaders: true, // Hide column header
    mixins: [
        'devilry.extjshelpers.AddPagerIfNeeded'
    ],

    rowTpl: Ext.create('Ext.XTemplate',
        '<div style="white-space:normal; line-height: 1.5em !important;">',
        '<span class="delivery_number">{delivery.number}:</span> ',
        '<tpl if="assignmentgroup.parentnode__delivery_types === 1">',
        '    <span class="not_in_devilry">Autogenerated by examiner</span>',
        '</tpl>',
        '<tpl if="assignmentgroup.parentnode__delivery_types !== 1">',
            '<span class="time_of_delivery">{delivery.time_of_delivery:date}</span>',
            '<tpl if="delivery.delivery_type == 0">',
                '<tpl if="delivery.time_of_delivery &gt; deadline.deadline">',
                     ' <span class="warningInlineItem">',
                        interpolate(gettext('After %(deadline_term)s'), {
                            deadline_term: gettext('deadline')
                        }, true),
                     '</span>',
                '</tpl>',
            '</tpl>',
        '</tpl>',
        '<tpl if="delivery.delivery_type == 2">',
            '<span class="neutralInlineItem">',
                interpolate(gettext('From previous %(period)s'), {
                    period_term: gettext('period')
                }, true),
            '</span>',
        '</tpl>',
        '<tpl if="hasLatestFeedback">',
        '   <span class="neutralInlineItem">', gettext('active feedback'), '</span>',
        '</tpl>',
        '<tpl if="feedback">',
        '   <span class="has-feedback" style="white-space:no-wrap">({feedback.grade})</span>',
        '</tpl>',
        '</div>'
    ),

    /**
     * @cfg {Object} [assignmentgroup_recordcontainer]
     * help
     */

    /**
     * @cfg {Object} [deadlineRecord]
     */

    /**
     * @cfg {Object} [delivery_recordcontainer]
     * A {@link devilry.extjshelpers.SingleRecordContainer} for Delivery.
     * The record is changed when a user selects a delivery.
     */


    initComponent: function() {
        var me = this;
        Ext.apply(this, {
            columns: [{
                header: 'Data',
                dataIndex: 'id',
                flex: 1,
                renderer: function(value, metaData, deliveryrecord) {
                    //console.log(deliveryrecord.data);
                    var staticfeedbackStore = deliveryrecord.staticfeedbacks();
                    return this.rowTpl.apply({
                        delivery: deliveryrecord.data,
                        hasLatestFeedback: deliveryrecord.hasLatestFeedback,
                        deadline: this.deadlineRecord.data,
                        assignmentgroup: this.assignmentgroup_recordcontainer.record.data,
                        feedback: staticfeedbackStore.count() > 0? staticfeedbackStore.data.items[0].data: undefined
                    });
                }
            }],
            listeners: {
                scope: this,
                select: this.onSelectDelivery
            }
        });

        this.addPagerIfNeeded();
        this.callParent(arguments);
    },

    /**
     * @private
     */
    onSelectDelivery: function(grid, deliveryRecord) {
        var allGrids = this.up('deliveriesgroupedbydeadline').query('deliveriesgrid');
        Ext.each(allGrids, function(grid, index) {
            if(grid !== this) {
                grid.getSelectionModel().deselectAll();
            }
        }, this);
        this.delivery_recordcontainer.setRecord(deliveryRecord);
    }
});
