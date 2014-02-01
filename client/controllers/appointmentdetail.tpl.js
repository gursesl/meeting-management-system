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
	return Attendees.find({"appointmentId": Session.get("selected")}).count() > 0;
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
    if(confirm('Are you sure you want to delete this event?')) {
    	Appointments.remove(Session.get("selected"));
    	Session.set("selected", null);
    	$.pnotify({
        title: 'Success',
        text: messages.eventdelete.success,
        type: 'success'
      });
    	return false;
    }
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
  } 

  if (Session.get("showTimeProposalsDialog")) {
    $('#timeProposalsModal').modal();
  } */
  //$('#updateAppointmentModal').modal('show');

  if (location.hash !== '') $('a[href="' + location.hash + '"]').tab('show');
    return $('a[data-toggle="tab"]').on('shown', function(e) {
      return location.hash = $(e.target).attr('href').substr(1);
    });
  
}

///////////////////////////////////////////////////////////////////////////////
//Update event dialog
///////////////////////////////////////////////////////////////////////////////

openUpdateAppointmentDialog = function () {
  Session.set("createError", null);
  Session.set("showUpdateAppointmentDialog", true);
  $('#updateAppointmentModal').modal('show');
}

sendOneInvite = function (invitee) {
  if (invitee.email.length && invitee.name.length && invitee.appointmentId.length) {
      Meteor.call("sendOneInvite", {
        toemail: invitee.email,
        toname: invitee.name,
        appointmentid: invitee.appointmentId
    }, function (error, appointment) {
      if (! error) {
        $.pnotify({
          title: 'Success',
          text: messages.inviteone.success,
          type: 'success'
        });
      }
    });
  } else {
      $.pnotify({
        title: 'Error',
        text: messages.inviteone.error,
        type: 'error'
      });
  }
}
