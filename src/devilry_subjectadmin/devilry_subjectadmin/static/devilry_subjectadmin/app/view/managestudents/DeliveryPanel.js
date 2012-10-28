Ext.define('devilry_subjectadmin.view.managestudents.DeliveryPanel' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.admingroupinfo_delivery',
    requires: [
        'devilry_extjsextras.DatetimeHelpers'
    ],

    /**
     * @cfg {Object} [delivery]
     */

    /**
     * @cfg {Object} [active_feedback]
     */

    /**
     * @cfg {int} [index_in_deadline]
     */

    metaTpl: [
        '<div class="gradeblock">',
            '<tpl if="latest_feedback">',
                '<h4>', gettext('Grade') ,'</h4>',
                '<p>',
                    '<tpl if="latest_feedback.is_passing_grade">',
                        '<span class="success">', gettext('Passed') ,'</span>',
                    '<tpl else>',
                        '<span class="danger">', gettext('Failed') ,'</span>',
                    '</tpl>',
                    ' <small class="muted">({latest_feedback.grade})</small>',
                '</p>',
            '</tpl>',
        '</div>',

        '<div class="activefeedbackblock">',
            '<tpl if="has_active_feedback">',
                '<h4>', gettext('Active feedback'), '</h4>',
                '<p><small class="muted">',
                    interpolate(gettext('This is the active %(feedback_term)s on this %(assignment_term)s. Unless an %(examiner_term)s creates a new %(feedback_term)s, this will be the final %(grade_term)s on this %(assignment_term)s.'), {
                        feedback_term: gettext('feedback'),
                        examiner_term: gettext('examiner'),
                        grade_term: gettext('grade'),
                        assignment_term: gettext('assignment')
                    }, true),
                '</small></p>',
            '</tpl>',
        '</div>',

        '<div class="timeofdeliveryblock">',
            '<h4>', gettext('Time of delivery'), '</h4>',
            '<p>',
                '<tpl if="delivery.after_deadline">',
                    '<span class="danger">',
                        gettext('{offset} AFTER the deadline.'),
                    '</span>',
                '<tpl else>',
                    '<small class="muted">',
                        gettext('{offset} before the deadline.'),
                    '</small>',
                '</tpl>',
                '<br/><small class="muted">({delivery.time_of_delivery})</small>',
            '</p>',
        '</div>',

        '<tpl if="delivery.delivered_by">',
            '<div class="deliverymadebyblock">',
                '<h4>', gettext('Delivery made by'), '</h4>',
                '<p class="madeby_displayname">{delivery.delivered_by.user.displayname}</p>',
            '</div>',
        '</tpl>',

        '<div class="fileblock">',
            '<h4>', gettext('Files'), '</h4>',
            '<ul>',
                '<tpl for="delivery.filemetas">',
                    '<li>',
                        '<p><a href="{download_url}" class="filename", title="{filename}">{[Ext.String.ellipsis(values.filename, 20)]}</a>',
                        ' <small class="filesize">({pretty_size})</small></p>',
                    '</li>',
                '</tpl>',
            '</ul>',
            '<a href="{delivery.download_all_url.zip}" class="downloadallfiles">',
                gettext('Download all files'),
            '</a>',
        '</div>'
    ],

    feedbackTpl: [
        '<tpl if="this.hasFeedback(latest_feedback)">',
            '<div class="feedback_rendered_view">{latest_feedback.rendered_view}</div>',
        '<tpl else>',
            '<p><small class="muted no_feedback">', gettext('No detailed feedback'), '</small></p>',
        '</tpl>', {
            hasFeedback: function(latest_feedback) {
                return latest_feedback && !Ext.isEmpty(latest_feedback.rendered_view);
            }
        }
    ],

    headerTpl: [
        '<h2>{delivery_text} #{delivery.number}</h2>'
    ],

    initComponent: function() {
        var latest_feedback = this.delivery.feedbacks[0];
        var has_active_feedback = this.active_feedback && this.active_feedback.delivery_id == this.delivery.id;

        //var metaTplCompiled = Ext.create('Ext.XTemplate', this.metaTpl, {
            //getFileDownloadUrl: Ext.bind(this._getFileDownloadUrl, this)
        //});

        Ext.apply(this, {
            cls: 'devilry_subjectadmin_admingroupinfo_delivery devilry_subjectadmin_admingroupinfo_delivery_' + (this._hasFeedback()? 'hasfeedback': 'nofeedback'),
            itemId: Ext.String.format('delivery-{0}', this.delivery.id),
            padding: 0,
            margin: this.index_in_deadline === 0? '0': '30 0 0 0',
            bodyPadding: 20,
            border: false,
            items: [{
                xtype: 'box',
                cls: 'bootstrap',
                tpl: this.headerTpl,
                data: {
                    delivery_text: gettext('Delivery'),
                    delivery: this.delivery
                }
            }, {
                xtype: 'container',
                layout: 'column',
                margin: '10 0 0 0',
                items: [{
                    columnWidth: 0.3,
                    xtype: 'box',
                    cls: 'bootstrap delivery_meta',
                    itemId: 'meta',
                    tpl: this.metaTpl,
                    data: {
                        delivery: this.delivery,
                        latest_feedback: latest_feedback,
                        has_active_feedback: has_active_feedback,
                        offset: devilry_extjsextras.DatetimeHelpers.formatTimedeltaShort(this.delivery.offset_from_deadline),
                        feedback_term: gettext('feedback'),
                        examiner_term: gettext('examiner'),
                        downloadAllUrl: this._getDownloadAllUrl()
                    }
                }, {
                    xtype: 'box',
                    columnWidth: 0.7,
                    tpl: this.feedbackTpl,
                    itemId: 'feedback',
                    cls: 'bootstrap',
                    padding: '12 0 0 40',
                    data: {
                        latest_feedback: latest_feedback
                    }
                }]
            }]
        });
        this.callParent(arguments);
    },

    _hasFeedback: function() {
        return this.delivery.feedbacks.length > 0;
    },

    _getDownloadAllUrl: function() {
        return Ext.String.format(
            '{0}/student/show-delivery/compressedfiledownload/{1}',
            DevilrySettings.DEVILRY_URLPATH_PREFIX, this.delivery.id
        );
    }
});
