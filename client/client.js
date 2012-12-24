"use strict";

///////////////////////////////////////////////////////////////////////////////
//Data subscriptions 
Meteor.subscribe("directory");
Meteor.subscribe("appointments");
Meteor.subscribe("timeproposals");
Meteor.subscribe("attendees");

///////////////////////////////////////////////////////////////////////////////
//Messages
var messages = {
  "eventcreate" : {"success" : "Event created successfully.", "error" : "There was an error creating the event."},
  "eventsave" : {"success" : "Event saved successfully.", "error" : "There was an error saving the event."},
  "eventdelete" : {"success" : "Event deleted successfully.", "error" : "There was an error deleting the event."},
  "inviteone" : {"success" : "Invite sent successfully.", "error" : "There was an error sending the invite."},
  "timeproposalcreate" : {"success" : "Time proposal created successfully.", "error" : "There was an error creating the time proposal."},
  "timeproposalsave" : {"success" : "Time proposal saved successfully.", "error" : "There was an error saving the time proposal."},
  "timeproposaldelete" : {"success" : "Time proposal deleted successfully.", "error" : "There was an error deleting the time proposal."},
  "attendeecreate" : {"success" : "Attendee added successfully.", "error" : "There was an error adding the attendee."},
  "attendeesave" : {"success" : "Attendee saved successfully.", "error" : "There was an error saving the attendee."},
  "attendeedelete" : {"success" : "Attendee deleted successfully.", "error" : "There was an error deleting the attendee."}
}


///////////////////////////////////////////////////////////////////////////////
//Router 

Meteor.Router.add({
    '/'						    : 'homepage',
    '/welcome'				: 'welcome',
    '/features'				: 'features',
    '/posts/:id'			: function(id) {
							      Session.set('postId', id);
							      return 'post';
							  },
    '/invite/:id/:email'	: function (id, email) {
    	var appt = Appointments.findOne(id);
    	if (appt) {
    		Session.set("selected", appt._id);
    		Session.set("appointment", appt);
    	}
    	
    	Session.set("inviteemail", email);
    	return "invitepage";
  }
});

Meteor.Router.filters({
  requireLogin: function(page) {
    if (Meteor.user()) {
      return "homepage";
    } else {
      return 'landingSlider';
    }
  }
});

Meteor.Router.filter('requireLogin', {only: 'homepage'});
  
///////////////////////////////////////////////////////////////////////////////
//Startup 
Meteor.startup(function () {
  Meteor.autorun(function () {
	  if (Meteor.user()) {
      if (! Session.get("selected")) {
        var appointment = Appointments.findOne({"owner": Meteor.userId()}, {sort: {time: -1}});
        if (appointment) {
          Session.set("selected", appointment._id);
        } else {
  		    Meteor.Router.to("/");  
  	    }
	    }
	}
  });
});

///////////////////////////////////////////////////////////////////////////////
//Helper functions
var okcancel_events = function (selector) {
  return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
}
	
var make_okcancelhandler = function (options) {
	var ok = options.ok || function () {};
	var cancel = options.cancel || function () {};
	
	return function (evt) {
		if (evt.type === "keydown" && evt.which === 27) {
			// escape = cancel
			cancel.call(this.evt);
		} else if (evt.type === "keyup" && evt.which === 13) {
			var value = String(evt.target.value || "");
			if (value)
				ok.call(this, value, evt);
			else
				cancel.call(this, evt);
		}
	};
};


///////////////////////////////////////////////////////////////////////////////
//Template: Homepage 
Template.homepage.events({
    'input input.event_search_box' : function () {
	   if (document.getElementsByName('find_event')[0].value != null | document.getElementsByName('find_event')[0].value != "") {
	     Session.set("eventname", document.getElementsByName('find_event')[0].value);
	   } else {
		  Session.set("eventname", null);
	   }
	},
	'click input.reset': function () {
		document.getElementsByName('find_event')[0].value="";
		Session.set("eventname", null);
	},
});
	
Template.newappointment.events({
	  'click #btnAddEvent': function (event, template) {
		  var title = template.find("#title").value;
		  var location = template.find("#location").value;
		  if (title.length && location.length) {
			  Meteor.call("createAppointment", {
				title: title,
				location: location
		  }, function (error, appointment) {
			  if (! error) {
				  showNotification({
              message: messages.eventcreate.success,
              autoClose: true,
              type: "success",
              duration: 2
          });
				  Session.set("selected", appointment);
				  openUpdateAppointmentDialog();
			  }
		  });
		  Session.set("showCreateDialog", false);
		  } else {
			  showNotification({
            message: messages.eventcreate.error,
            autoClose: true,
            type: "error",
            duration: 4
        });
		  }
	  }
  });
  
  
  Template.newappointment.events[okcancel_events('#location')] = make_okcancelhandler({
    ok: function (text, event) {
      var nameEntry = document.getElementById('title');
      if (nameEntry.value != "") {
        var ts = Date.now() / 1000;
        Appointments.insert({title: nameEntry.value, location: text, time: ts});
        event.target.value = "";
      }
    }
  });

///////////////////////////////////////////////////////////////////////////////
//Template: Dashboard
Template.dashboard.anyAppointments = function() {
  if (Meteor.user()) {
    return Appointments.find({"owner": Meteor.userId()}).count() > 0;
  } else {
	return null;
  }
};
	
Template.dashboard.appointments = function () {
  if (Session.get("eventname") != null && Session.get("eventname") != "") {
    var regex = new RegExp(Session.get("eventname"), "i");
      return Appointments.find({"owner": this.userId, title: regex}, { sort: {time: -1}});
  } else {
	  return Appointments.find({"owner": this.userId}, {sort: {time: -1}});
  }
}

///////////////////////////////////////////////////////////////////////////////
//Template: Attendee
  
Template.attendee.events({
    'click .linkDeleteAttendee' : function( event, template) {
      Attendees.remove(this._id);
      showNotification({
          message: messages.attendeedelete.success,
          autoClose: true,
          type: "success",
          duration: 2
      });
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
			  showNotification({
            message: messages.attendeesave.success,
            autoClose: true,
            type: "success",
            duration: 2
        });
		  }
	  });
	  Session.set("editattendee", false);
    Session.set("selectedattendee", null);
  } else {
    showNotification({
        message: messages.attendeesave.error,
        autoClose: true,
        type: "error",
        duration: 4
    });
  }
}


///////////////////////////////////////////////////////////////////////////////
//Template: Appointment
Template.appointment.selected = function () {
  //Router.setEvent(Session.get("selected"));
  return Session.equals("selected", this._id) ? "selected" : '';
};
  
Template.appointment.events({
  'click': function () {
    Session.set("selected", this._id);
  },
  'click #linkTimeProposals' : function( event, template) {
    openTimeProposalsDialog();
  },
  'click #linkAttendees' : function (event, template) {
    openAttendeesDialog();
  },
  'click #linkUpdateEvent' : function (event, template) {
    openUpdateAppointmentDialog();  
  },
  'click #linkDeleteEvent' : function (event, template) {
    	Appointments.remove(Session.get("selected"));
    	Session.set("selected", null);
    	showNotification({
          message: messages.eventdelete.success,
          autoClose: true,
          type: "success",
          duration: 2
      });
    	return false;
  }
});


///////////////////////////////////////////////////////////////////////////////
// Template: Appointment Detail
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
    	showNotification({
          message: messages.eventdelete.success,
          autoClose: true,
          type: "succeess",
          duration: 2
      });
    	return false;
  },
  'click .linkSendOneInvite' : function (event, template) {
    sendOneInvite(event, template, this);
  },
  'click .linkSendInvites' : function (event, template) {
    console.log("Emailing invitations to all attendees...");
    alert("Invited everybody on the list!");
  }
});

var sendOneInvite = function (event, template, invitee) {
  var to = invitee.email;
  var aptid = invitee.appointmentId;
  if (to.length && aptid.length) {
		  Meteor.call("sendOneInvite", {
		    toemail: to,
			  appointmentid: aptid
	  }, function (error, appointment) {
		  if (! error) {
			  	showNotification({
              message: messages.inviteone.success,
              autoClose: true,
              type: "success",
              duration: 2
          });
		  }
	  });
  } else {
    showNotification({
        message: messages.inviteone.error,
        autoClose: true,
        type: "error",
        duration: 4
    });
  }
}

///////////////////////////////////////////////////////////////////////////////
//Template: Time proposal
Template.timeproposal.events({
  'click #linkDeleteTimeProposal' : function (event, template) {
		TimeProposals.remove(this._id);
		showNotification({
        message: messages.timeproposaldelete.success,
        autoClose: true,
        type: "success",
        duration: 2
    });
  },
  'click #linkEditTimeProposal' : function (event, template) {
    Session.set("edittimeproposal", true);
    Session.set("selectedtimeproposal", this._id);
  },
  'click .linkSave' : function (event, template) {
    saveTimeProposal(event, template);
  },
  'click .linkCancelSave' : function (event, template) {
    Session.set("edittimeproposal", false);
    Session.set("selectedtimeproposal", null);
  },
  'click .timepropitem' : function (event, template) {
    Session.set("edittimeproposal", true);
    Session.set("selectedtimeproposal", this._id);
  }
});

Template.timeproposal.edittimepropsal = function() {
  return Session.get("edittimeproposal") && (Session.get("selectedtimeproposal") == this._id);
}

Template.timeproposal.rendered = function () {
  // at .created() time, it's too early to run rateit(), so run it at rendered()
  $(this.findAll('.rateit')).rateit({
    readonly: true
  });
  
  $('#txtNewPropsalDate').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: true,
    autoclose: true
  });
}

Template.timeproposal.avgrating = function () {
	var avgrating = TimeProposals.findOne(this._id);
	var count = 0;
	var sum = 0;
	avgrating.rsvps.forEach(function (entry) {
	  sum += entry.rating;
	  count += 1;
	});
	
	return new Number(sum/count).toPrecision(3);
}

Template.timeproposal.votes = function () {
	var rt = TimeProposals.findOne(this._id);
	var count = 0;
	rt.rsvps.forEach(function (entry) {
	  count += 1;
	});
	
	return count;
}

var saveTimeProposal = function (event, template) {
  var date = template.find("#txtNewPropsalDate").value;
  var time = template.find("#txtNewPropsalTime").value;
  if (date.length && time.length) {
		  Meteor.call("updateTimeProposal", {
		    id: template.data._id,
			  date: date,
			  time: time
	  }, function (error, appointment) {
		  if (! error) {
			  showNotification({
            message: messages.timeproposalsave.success,
            autoClose: true,
            type: "success",
            duration: 2
        });
		  }
	  });
	  Session.set("edittimeproposal", false);
    Session.set("selectedtimeproposal", null);
  } else {
    showNotification({
        message: messages.timeproposalsave.error,
        autoClose: true,
        type: "error",
        duration: 4
    });
  }
}

  
///////////////////////////////////////////////////////////////////////////////
//Attendees dialog
var openAttendeesDialog = function () {
  Session.set("createError", null);	
  Session.set("showAttendeesDialog", true);
};

///////////////////////////////////////////////////////////////////////////////
//Time proposals dialog 
var openTimeProposalsDialog = function () {
  Session.set("createError", null);
  Session.set("showTimeProposalsDialog", true);
};

///////////////////////////////////////////////////////////////////////////////
//Update event dialog
var openUpdateAppointmentDialog = function () {
    Session.set("createError", null);
    Session.set("showUpdateAppointmentDialog", true);
}


///////////////////////////////////////////////////////////////////////////////
//Template: Homepage
Template.homepage.showUpdateAppointmentDialog = function () {
  return Session.get("showUpdateAppointmentDialog");
};

Template.homepage.showTimeProposalsDialog = function () {
  return Session.get("showTimeProposalsDialog");
};

Template.homepage.showAttendeesDialog = function () {
  return Session.get("showAttendeesDialog");
};

///////////////////////////////////////////////////////////////////////////////
//Template: Update event page
Template.updateAppointmentDialog.selected = function () {
  return Appointments.findOne(Session.get("selected"));
};

Template.updateAppointmentDialog.events({
	'click #btnVoteTimeProposals' : function (event, template) {
		if (! Session.get("voted"))
		  alert ("You have not casted a vote yet. Are you sure you want to navigate out?");
		else {
			Session.set("votedthankyou", true);
		}
	},
	'click .done': function (event, template) {
	    Session.set("showUpdateAppointmentDialog", false);
	    return false;
	  },
    'click #btnUpdateAppointment' : function (event, template) {
       var title = template.find("#txttitle").value;
       var location = template.find("#txtlocation").value;
       var description = template.find("#txtdescription").value;
       var proposalType = template.find("#proposalType").value;
  		  if (title.length && location.length) {
  			  Meteor.call("updateAppointment", {
  			    id: Session.get("selected"),
  				  title: title,
  				  location: location,
  				  description: description,
  				  proposalType: proposalType
  		  }, function (error, appointment) {
  			  if (! error) {
  				  showNotification({
                message: messages.eventsave.success,
                autoClose: true,
                type: "success",
                duration: 2
            });
  			  }
  		  });
  		  Session.set("showUpdateAppointmentDialog", false);
      } else {
        Session.set("updateError", "A title and location is needed to update an event.");
      }
    }
});


///////////////////////////////////////////////////////////////////////////////
//Template: Invite page
Template.invitepage.event = function () {
  return Session.get("selected");
};

Template.invitepage.appointment = function () {
  return Session.get("appointment");
};

Template.invitepage.email = function () {
  return Session.get("inviteemail");
};

Template.invitepage.selected = function () {
  return Appointments.findOne(Session.get("appointment"));
};

Template.invitepage.anyTimeProposal = Template.appointmentdetail.anyTimeProposal;
Template.invitepage.timeproposals = Template.appointmentdetail.timeproposals;

Template.invitepage.showVotedThankYou = function() {
    return Session.get("votedthankyou");
}

Template.invitepage.events({
	'click #btnVoteTimeProposals' : function (event, template) {
		if (! Session.get("voted"))
		  alert ("You have not casted a vote yet. Are you sure you want to navigate out?");
		else {
			Session.set("votedthankyou", true);
		}
	}
});


///////////////////////////////////////////////////////////////////////////////
//Template: Invite time proposal
Template.invitetimeproposal.events({
	'click .rateit' : function (event, template) {
		Session.set("voted", true);
		var rateid = '#' + this._id;
		var rating = $(rateid).rateit('value')
		
		var userRatedAlready = TimeProposals.findOne({"_id" : this._id, "rsvps.email" : Session.get("inviteemail")});
		console.log("Session email: " + Session.get("inviteemail") + " ---- userRatedAlready: " + userRatedAlready);
		if (userRatedAlready) {
		  TimeProposals.update({"_id" : this._id, "rsvps.email" : Session.get("inviteemail")}, {$set : {"rsvps.$.rating" : rating}});
		} else {
			TimeProposals.update({"_id" : this._id}, {$push : {"rsvps" : {"email" : Session.get("inviteemail"), "rating" : rating}}});
		}
	}
});

Template.invitetimeproposal.rendered = function () {
  // at .created() time, it's too early to run rateit(), so run it at rendered()
  $(this.findAll('.rateit')).rateit();
}

Template.invitetimeproposal.avgrating = function () {
	var avgrating = TimeProposals.findOne(this._id);
	var count = 0;
	var sum = 0;
	avgrating.rsvps.forEach(function (entry) {
	  sum += entry.rating;
	  count += 1;
	});
	
	return new Number(sum/count).toPrecision(3);
}

Template.invitetimeproposal.votes = function () {
	var rt = TimeProposals.findOne(this._id);
	var count = 0;
	rt.rsvps.forEach(function (entry) {
	  count += 1;
	});
	
	return count;
}


///////////////////////////////////////////////////////////////////////////////
//Template: Attendees dialog
Template.attendeesDialog.events({
	'click #btnAddAttendee': function(event, template) {
		console.log("Adding attendee ...");
		var name=template.find("#attendeeName").value;
		var email=template.find("#attendeeEmail").value;
	    if (name.length && email.length) {
	      Meteor.call("addAttendee", Session.get("selected"), {
	    	  name: name,
	    	  email: email
	    }, function (error) {
	    	if (! error) {
				  showNotification({
              message: messages.attendeecreate.success,
              autoClose: true,
              type: "success",
              duration: 2
          });
			  }
	    });
	  } else {
		  showNotification({
          message: messages.attendeecreate.error,
          autoClose: true,
          type: "error",
          duration: 4
      });
	  }
	},
	'click .done': function (event, template) {
	    Session.set("showAttendeesDialog", false);
	    return false;
	  } 
});

Template.attendeesDialog.error = function() {
  return Session.get("createError");	
};

///////////////////////////////////////////////////////////////////////////////
//Template: Time proposals dialog
Template.timeProposalsDialog.events({
  'click #btnAddTimeProposals': function (event, template) {
    var propDate = template.find("#proposalDate").value;
	  var propTime = template.find("#proposalTime").value;
    if (propDate.length && propTime.length) {
    	console.log("Adding time proposals for event " + Session.get("selected"));
		  Meteor.call("addTimeProposal", Session.get("selected"), {
		    pdate: propDate,
			  ptime: propTime
	  }, function (error) {
		  if (! error) {
			  showNotification({
            message: messages.timeproposalcreate.success,
            autoClose: true,
            type: "success",
            duration: 2
        });
		  }
	  });
    } else {
		   showNotification({
            message: messages.timeproposalcreate.error,
            autoClose: true,
            type: "error",
            duration: 4
        });
	  }
  },
  'click .done': function (event, template) {
    Session.set("showTimeProposalsDialog", false);
    return false;
  }
});

Template.timeProposalsDialog.error = function() {
  return Session.get("createError");	
};

Template.timeProposalsDialog.rendered=function() {
    $('#proposalDate').datepicker({
      format: 'mm/dd/yyyy',
      todayBtn: true,
      autoclose: true
    });
}