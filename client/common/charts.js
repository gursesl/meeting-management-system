///////////////////////////////////////////////////////////////////////////////
// Charts
///////////////////////////////////////////////////////////////////////////////
buildInvitedAttendeesPieChart = function() {
  var chart;
  chart = new Highcharts.Chart({
      chart: {
        renderTo: 'pieinvited' 
      },
      title: {
          text: 'Sent Invite'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>',
          percentageDecimals: 1
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 0,
        y: 230
      },
      plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            showInLegend: true,
            dataLabels: {
                  enabled: true,
                  crop: false,
                  distance: -42,
                  color: '#fff',
                  connectorColor: '#000000',
                  formatter: function() {
                      return '<b>'+ this.point.name +'</b>: '+ this.point.y;
                  }
             }
          }
      },
      series: [{
          type: 'pie',
          name: 'Number of attendees',
          data: [
              {name:'Invited', y: getAttendeesForAnEvent(Session.get("selected"), true), color: '#51A351', selected:true, sliced:false}, {name: 'Not Invited', y:getAttendeesForAnEvent(Session.get("selected"), false), color:'#0088CC'}
          ]
      }]
  });
}



buildEmailReadPieChart = function() {
  var chart;
  chart = new Highcharts.Chart({
      chart: {
        renderTo: 'pieemailread' 
      },
      title: {
          text: 'Read Invite'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>',
          percentageDecimals: 1
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 0,
        y: 230
      },
      plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            showInLegend: true,
            dataLabels: {
                  enabled: true,
                  crop: false,
                  distance: -42,
                  color: '#fff',
                  connectorColor: '#000000',
                  formatter: function() {
                      return '<b>'+ this.point.name +'</b>: '+ this.point.y;
                  }
             }
          }
      },
      series: [{
          type: 'pie',
          name: 'Number of attendees',
          data: [
              {name:'Read', y: getReadEmails(Session.get("selected"), true), color: '#51A351', selected:true, sliced:false}, {name: 'Not Read', y:getReadEmails(Session.get("selected"), false), color:'#0088CC'}
          ]
      }]
  });
}

buildClicksPieChart = function() {
  var chart;
  chart = new Highcharts.Chart({
      chart: {
        renderTo: 'pieclicks' 
      },
      title: {
          text: 'Clicked Invite Link'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>',
          percentageDecimals: 1
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 0,
        y: 230
      },
      plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            showInLegend: true,
            dataLabels: {
                  enabled: true,
                  crop: false,
                  distance: -42,
                  color: '#fff',
                  connectorColor: '#000000',
                  formatter: function() {
                      return '<b>'+ this.point.name +'</b>: '+ this.point.y;
                  }
             }
          }
      },
      series: [{
          type: 'pie',
          name: 'Number of attendees',
          data: [
              {name:'Clicked', y: getClicks(Session.get("selected"), true), color: '#51A351', selected:true, sliced:false}, {name: 'Not Clicked', y:getClicks(Session.get("selected"), false), color:'#0088CC'}
          ]
      }]
  });
}

buildVotesPieChart = function() {
  var chart;
  chart = new Highcharts.Chart({
      chart: {
        renderTo: 'pievotes' 
      },
      title: {
          text: 'Voted'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>',
          percentageDecimals: 1
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        backgroundColor: '#FFFFFF',
        align: 'left',
        verticalAlign: 'top',
        floating: true,
        x: 0,
        y: 230
      },
      plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            showInLegend: true,
            dataLabels: {
                  enabled: true,
                  crop: false,
                  distance: -42,
                  color: '#fff',
                  connectorColor: '#000000',
                  formatter: function() {
                      return '<b>'+ this.point.name +'</b>: '+ this.point.y;
                  }
             }
          }
      },
      series: [{
          type: 'pie',
          name: 'Number of attendees',
          data: [
              {name:'Voted', y: getVotes(Session.get("selected"), true), color: '#51A351', selected:true, sliced:false}, {name: 'Not Voted', y:getVotes(Session.get("selected"), false), color:'#0088CC'}
          ]
      }]
  });
}