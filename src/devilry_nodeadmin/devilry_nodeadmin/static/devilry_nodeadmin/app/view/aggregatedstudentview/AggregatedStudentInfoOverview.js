Ext.define('devilry_nodeadmin.view.aggregatedstudentview.AggregatedStudentInfoOverview' ,{
  extend: 'Ext.container.Container',
  alias: 'widget.aggregatedstudentinfo',
  cls: 'bootstrap',
  title: 'Aggregated Student Info',

  layout: 'fit',
  padding: '40',
  autoScroll: true,

  items: [{
    xtype: 'box',
    itemId: 'AggregatedStudentInfoBox',
    tpl: ['<div class=devilry_focuscontainer style="padding: 20px; margin-bottom: 20px;">', '<h1>', gettext('Aggregated Student Information'), '</h1>',
          '<h3>{data.user.displayname}</h3> <h4>{data.user.username} / {data.user.email}</h4>',
          '</div>',
              '<tpl for="data.grouped_by_hierarky">',
                    '<div class="devilry_focuscontainer" style="padding: 20px; margin-bottom: 20px;">',
                      '<h2> {long_name} </h2>',
                      '<tpl for="periods">',
                          '<h3> {long_name} </h3>',
                          '<table class="table table-condensed">',
                          '<tr>',
                          '<tpl if="is_relatedstudent">',
                              '<td style="width: 100px"><span class="label label-success">', gettext('Registred as student on period'), '</span></td>',
                          '<tpl else>',
                              '<td><span class="label label-important">', gettext('Not registred as student on period'), '</span></td>',
                          '</tpl>',
                            '<td> <span class="label label-success"> Qualified for exams</span></td>',
                          '</tr>',
                          '</table>',
                          '<table class="table table-striped table-bordered table-hover">',
                          '<tr class="info"> <td>Assignment</td> <td>Feedback Status</td> <td> Result </td> </tr>',
                          '<tpl for="assignments">',
                              '<tr>',
                              '<td> {long_name} </td>',
                              '<tpl for="groups">',
                                  '<td> {status} </td>',
                                  '<tpl if="active_feedback">',
                                      '<tpl if="active_feedback.feedback.is_passing_grade">',
                                          '<td>', gettext('Approved'), '</td>',
                                      '<tpl else>',
                                          '<td>', gettext('Not Approved'), '</td>',
                                      '</tpl>',
                                  '<tpl else>',
                                      '<td>', gettext('No info available'), '</td>',
                                  '</tpl>',
                              '</tpl>',
                              '</tr>',
                          '</tpl>',
                      '</table>',
                      '</tpl>',
                    '</div>', 
                '</tpl>',

              {

                help: function(rec) {
                  console.log("TPL: " + rec);
                  
                }

                
                
              }]
    
  }]

});
