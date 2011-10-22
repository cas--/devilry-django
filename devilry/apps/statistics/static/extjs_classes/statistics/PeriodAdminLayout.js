Ext.define('devilry.statistics.PeriodAdminLayout', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.statistics-periodadminlayout', // NOTE: devilry.statistics.sidebarplugin.qualifiesforexam.Manual depends on this alias
    layout: 'border',
    requires: [
        'devilry.statistics.Loader',
        'devilry.statistics.LabelConfig',
        'devilry.statistics.FilterEditor',
        'devilry.statistics.LabelOverview',
        'devilry.statistics.LabelConfigEditor',
        'devilry.statistics.SidebarPluginContainer',
        'devilry.statistics.dataview.DataView',
        'devilry.statistics.sidebarplugin.qualifiesforexam.Main'
    ],

    config: {
        periodid: undefined,
        sidebarplugins: [
            'devilry.statistics.sidebarplugin.qualifiesforexam.Main'
        ]
    },

    constructor: function(config) {
        this.initConfig(config);
        this.callParent([config]);
    },
    
    initComponent: function() {
        Ext.apply(this, {
            style: 'background-color: transparent',
            items: [{
                region: 'north',
                xtype: 'pageheader',
                navclass: 'administrator'
            }, {
                region: 'south',
                xtype: 'pagefooter'
            }, this._center = Ext.widget('container', {
                region: 'center',
                layout: 'fit',
                padding: {left: 20, right: 20}
            })]
        });
        this.callParent(arguments);
        this._loadStudents();
    },

    _loadStudents: function() {
        Ext.getBody().mask("Loading page", 'page-load-mask');
        Ext.create('devilry.statistics.Loader', this.periodid, {
            listeners: {
                scope: this,
                loaded: this._onLoaded
            }
        });
    },

    _onLoaded: function(loader) {
        Ext.getBody().unmask();

        this._center.add({
            xtype: 'panel',
            layout: 'border',
            items: [{
                xtype: 'statistics-sidebarplugincontainer',
                //flex: 3,
                title: 'Label students',
                region: 'east',
                collapsible: true,
                width: 300,
                autoScroll: true,
                loader: loader,
                sidebarplugins: this.sidebarplugins
            }, this._dataview = Ext.widget('statistics-dataview', {
                //flex: 7,
                region: 'center',
                loader: loader
            })]
        });

        //var qualifiesForExam = Ext.create('devilry.statistics.LabelConfig', {
            //label: 'qualifies-for-exam'
        //});
        //qualifiesForExam.addFilter({
            //must_pass: [
                //[loader.getAssignmentByShortName('week1').get('id'), loader.getAssignmentByShortName('week3').get('id')],
                //[loader.getAssignmentByShortName('week2').get('id')]
            //],
            //pointspec: Ext.create('devilry.statistics.PointSpec', {
                //assignments: [
                    //[loader.getAssignmentByShortName('week2').get('id'), loader.getAssignmentByShortName('week3').get('id')],
                    //[loader.getAssignmentByShortName('week1').get('id')]
                //],
                //min: 10,
                //max: 40
            //})
        //});




        //this.aggregatedStore.filter(
            //Ext.create('Ext.util.Filter', {
                //filterFn: function(item) {
                    //var username = item.get('username');
                    //var student = loader.getStudentByName(username);
                    //var m = approvedFilter.match(loader, student);
                    //return m;
                //}
            //})
        //);
    }
});
