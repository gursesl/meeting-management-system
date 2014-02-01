///////////////////////////////////////////////////////////////////////////////
// Template: Appointment Detail
///////////////////////////////////////////////////////////////////////////////

Template.appointmentdetail.anyTimeProposal = function() {
	return TimeProposals.find({"appointmentId": Session.get("selected")}).count() > 0;
};

Template.appointmentdetail.timeproposals = function() {
	return TimeProposals.find({"appointmentId": Session.get("selected")});
};

Template.appointmentdetail.anyAttendee = function() {
  var found = Attendees.find({"appointmentId": Session.get("selected")}).count() > 0;
	return true;
};

Template.appointmentdetail.attendees = function() {
	return Attendees.find({"appointmentId": Session.get("selected")});
};

Template.appointmentdetail.selected = function () {
  return Appointments.findOne(Session.get("selected"));
};

Template.appointmentdetail.path = function () {
  return Meteor.absoluteUrl("invite/" + Session.get("selected") + "/anon");
};

Template.appointmentdetail.tracking = function () {
  return Meteor.absoluteUrl("tracking/" + Session.get("selected") + "/anon");
};
  
Template.appointmentdetail.events({
  'click .btnTimeProposals' : function( event, template) {
    openTimeProposalsDialog();
  },
  'click .btnAttendees' : function (event, template) {
    openAttendeesDialog();
  },
  'click .btnUpdateEvent' : function (event, template) {
    openUpdateAppointmentDialog();  
  },
  'click .btnDeleteEvent' : function (event, template) {
    	Appointments.remove(Session.get("selected"));
    	Session.set("selected", null);
    	$.pnotify({
        title: 'Success',
        text: messages.eventdelete.success,
        type: 'success'
      });
    	return false;
  },
  'click .linkSendOneInvite' : function (event, template) {
    sendOneInvite(this);
  },
  'click .linkSendInvites' : function (event, template) {
    var attendees = Attendees.find({"appointmentId": Session.get("selected")});
    attendees.forEach (function (attendee) {
      sendOneInvite(attendee);
    });
    $.pnotify({
      title: 'Success',
      text: messages.inviteall.success,
      type: 'success'
    });
  }
});

Template.appointmentdetail.rendered = function() {
  // Build the chart
  // TODO: Fix this shit
  buildInvitedAttendeesPieChart();
  buildEmailReadPieChart();
  buildClicksPieChart();
  buildVotesPieChart();
  
  /*
  if (Session.get("showUpdateAppointmentDialog")) {
    $('#updateAppointmentModal').modal();
  } */
}

///////////////////////////////////////////////////////////////////////////////
//Update event dialog
///////////////////////////////////////////////////////////////////////////////

openUpdateAppointmentDialog = function () {
  Session.set("createError", null);
  Session.set("showUpdateAppointmentDialog", true);
  $('#updateAppointmentModal').modal();
}
