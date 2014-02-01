///////////////////////////////////////////////////////////////////////////////
//Template: Attendee
///////////////////////////////////////////////////////////////////////////////
  
Template.attendee.events({
    'click .linkDeleteAttendee' : function( event, template) {
      if(confirm('Are you sure you want to delete this attendee?')) {
        Attendees.remove(this._id);
        $.pnotify({
          title: 'Success',
          text: messages.attendeedelete.success,
          type: 'success'
        });
      }
    },
    'click .linkEditAttendee' : function (event, template) {
      Session.set("editattendee", true);
      Session.set("selectedattendee", this._id);
    },
    'click .linkSave' : function (event, template) {
      saveAttendee(event, template);
    },
    'click .linkCancelSave' : function (event, template) {
      Session.set("editattendee", false);
      Session.set("selectedattendee", null);
    }
});

Template.attendee.editattendee = function () {
  return Session.get("editattendee") && (Session.get("selectedattendee") == this._id);
}

var saveAttendee = function (event, template) {
  var name = template.find("#txtNewAttendeeName").value;
  var email = template.find("#txtNewAttendeeEmail").value;
  if (name.length && email.length) {
		  Meteor.call("updateAttendee", {
		    id: template.data._id,
			  name: name,
			  email: email
	  }, function (error, attendee) {
		  if (! error) {
        $.pnotify({
          title: 'Success',
          text: messages.attendeesave.success,
          type: 'success'
        });
		  }
	  });
	  Session.set("editattendee", false);
    Session.set("selectedattendee", null);
  } else {
      $.pnotify({
        title: 'Error',
        text: messages.attendeesave.error,
        type: 'error'
      });
  }
}

Template.attendeesDialog.rendered=function() {
  //$('#attendeesModal').modal('show');
}

///////////////////////////////////////////////////////////////////////////////
//Attendees dialog
///////////////////////////////////////////////////////////////////////////////

openAttendeesDialog = function () {
  Session.set("createError", null);
  Session.set("showAttendeesDialog", true);
  $('#attendeesModal').modal('show');
};