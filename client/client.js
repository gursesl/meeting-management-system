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
  "eventcreate" : {"success" : "Event created successfully.", "error" : "There was an error creating the event.", "validation" : "Event name and location are required to create an event."},
  "eventsave" : {"success" : "Event saved successfully.", "error" : "There was an error saving the event."},
  "eventdelete" : {"success" : "Event deleted successfully.", "error" : "There was an error deleting the event."},
  "inviteone" : {"success" : "Invite sent successfully.", "error" : "There was an error sending the invite."},
  "inviteall" : {"success" : "Invite sent successfully to all attendees.", "error" : "There was an error sending the invite."},
  "timeproposalcreate" : {"success" : "Time proposal created successfully.", "error" : "There was an error creating the time proposal.", "validation" : "Date and time are required to create a time proposal."},
  "timeproposalsave" : {"success" : "Time proposal saved successfully.", "error" : "There was an error saving the time proposal."},
  "timeproposaldelete" : {"success" : "Time proposal deleted successfully.", "error" : "There was an error deleting the time proposal."},
  "attendeecreate" : {"success" : "Attendee added successfully.", "error" : "There was an error adding the attendee."},
  "attendeesave" : {"success" : "Attendee saved successfully.", "error" : "There was an error saving the attendee."},
  "attendeedelete" : {"success" : "Attendee deleted successfully.", "error" : "There was an error deleting the attendee."},
  "voting" : {"success" : "Thank you for casting your vote. You can vote on multiple events and you can change your vote at any time by voting again.", "error" : "There was an error casting your vote. Please try again later."},
}

///////////////////////////////////////////////////////////////////////////////
//Router 

Meteor.Router.add({
    '/'						    : 'homepage',
    "/dashboard"      : 'dashboard',
    '/features'				: 'features',
    '/posts/:id'			: function(id) {
      Session.set('postId', id);
      return 'post';
  },
  
  '/invite/:id/:email'	: function (id, email) {
    console.log("invite router on the client");
  	var appt = Appointments.findOne(id);
  	if (appt) {
  		Session.set("selected", appt._id);
  		Session.set("appointment", appt);
  		trackClickInviteLink(appt._id, email);
  	}
  	
  	Session.set("inviteemail", email);
  	return 'invitepage';
  }
});

///////////////////////////////////////////////////////////////////////////////
//Tracking: Click Invite Link
var trackClickInviteLink = function (appointmentid, email) {
  if (appointmentid.length && email.length) {
    Meteor.call("updateAttendeeClickInviteLink", {
      appointmentId: appointmentid,
      email: email
      }, function (error) {
		    if (! error)
			    console.log("Link click tracking updated successfully.");
			  else
			    console.log(error.reason);
    });
  }
}

var trackVote = function (appointmentid, email) {
  console.log("Vote click for event " + appointmentid + " and email " + email);
  if (appointmentid && email && appointmentid.length && email.length) {
    Meteor.call("updateAttendeeVoteTracking", {
      appointmentId: appointmentid,
      email: email
      }, function (error) {
		    if (! error){
		      console.log("Vote tracking updated successfully.");
			    showNotification({
              message: messages.voting.success,
              autoClose: true,
              type: "success",
              duration: 10
          });
        } else {
          console.log(error.reason);
			    showNotification({
              message: messages.voting.error,
              autoClose: true,
              type: "error",
              duration: 8
          });
        }
    });
  }
}

///////////////////////////////////////////////////////////////////////////////
//Start up

Meteor.startup(function () {
  console.log("startup");
    
  Meteor.autorun(function () {
    console.log("autorun");
	  if (Meteor.userId()) {
      console.log("autorun:user change");
      if (! Session.get("selected")) {
        var appointment = Appointments.findOne({"owner": Meteor.userId()}, {sort: {time: -1}});
        if (appointment) {
          Session.set("selected", appointment._id);
  	    }
	    }
	  }
  });
});

///////////////////////////////////////////////////////////////////////////////
//Utility functions
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
	}
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//Template: Homepage 
Template.homepage.events({
    'input input.event_search_box' : function () {
	   if (document.getElementsByName('find_event')[0].value != null | document.getElementsByName('find_event')[0].value != "") {
	     Session.set("eventname", document.getElementsByName('find_event')[0].value);
	   } else {
		  Session.set("eventname", null);
	   }
	}
});

Template.homepage.isuser = function() {
  return Meteor.user();
}

Template.newappointment.events({
	  'click #btnAddEvent': function (event, template) {
		  var title = template.find("#title").value;
		  var location = template.find("#location").value;
		  if (title.length && location.length) {
			  Meteor.call("createAppointment", {
				title: title,
				location: location,
				description: ""
		  }, function (error, appointment) {
			  if (! error) {
				  showNotification({
              message: messages.eventcreate.success,
              autoClose: true,
              type: "success",
              duration: 4
          });
				  Session.set("selected", appointment);
				  openUpdateAppointmentDialog();
			  } else {
			    showNotification({
              message: messages.eventcreate.error,
              autoClose: true,
              type: "error",
              duration: 4
          });
			  }
		  });
		  Session.set("showCreateDialog", false);
		  } else {
			  showNotification({
            message: messages.eventcreate.validation,
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
    return Appointments.find({"owner": Meteor.user()._id}, {sort: {time: -1}});
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
          duration: 4
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
            duration: 4
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
          duration: 4
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
    	showNotification({
          message: messages.eventdelete.success,
          autoClose: true,
          type: "succeess",
          duration: 4
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
    
    showNotification({
      message: messages.inviteall.success,
      autoClose: true,
      type: "succeess",
      duration: 4
    });
  }
});

Template.appointmentdetail.rendered = function() {
  // Build the chart
  buildInvitedAttendeesPieChart();
  buildEmailReadPieChart();
  buildClicksPieChart();
  buildVotesPieChart();
  console.log("appointment detail template rendered");
}

var sendOneInvite = function (invitee) {
  if (invitee.email.length && invitee.name.length && invitee.appointmentId.length) {
		  Meteor.call("sendOneInvite", {
		    toemail: invitee.email,
		    toname: invitee.name,
			  appointmentid: invitee.appointmentId
	  }, function (error, appointment) {
		  if (! error) {
			  	showNotification({
              message: messages.inviteone.success,
              autoClose: true,
              type: "success",
              duration: 4
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
        duration: 4
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
            duration: 4
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
//Template: Landing slider
Template.landingSlider.events({
  'click #linkGetStartedToday' : function (event, template) {
    slideHomePageWizard(event, template);
  } 
});

///////////////////////////////////////////////////////////////////////////////
//Template: Header

Template.header.events({
  'click #linkHomeNavCreateEvent' : function (event, template) {
    slideHomePageWizard(event, template);
  }
});

var slideHomePageWizard = function(event, template) {
  console.log("create event clicked");
  console.log(Session.get("wizone"));
  if (Session.get("wizone") || Session.get("wiztwo")) {
    // Reset session vars
    Session.set("wizone", null);
    Session.set("wiztwo", null);

    // Reset div heights
    transition("one", null);
    transition("two", null);
    
    // Animate panes
    $(".wizardPane").css({"height" : "0px"});
    $(".wizardPaneStep").css({"opacity" : "0"});
        
    // Deselect button
    $("#lione").removeClass("selected");
    $("#lione .ca-icon").removeClass("selected");
    $("#lione .ca-main").removeClass("selected");
  } else {
    // Set session vars
    console.log("slide else block");
    //Session.set("wizone", true);
    $(".wizardPane").css({"height" : "500px"});
    $(".wizardPaneStep").css({"opacity" : "1"});

    // Animate panes
    transition(null, "one");
    //$("#homewizstepone").css({"height" : "400px"});
    //$("#homewizstepone").css({"opacity" : "1"});
    
    // Keep button selected
    $("#lione").addClass("selected");
    $("#lione .ca-icon").addClass("selected");
    $("#lione .ca-main").addClass("selected");
  }
}

Template.header.rendered = function (event, template) {
    //slideHomePageWizard(event, template);
    console.log("header template rendered");
    //transition(null, "one");
    //Session.set("wizone", true);
}

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
                duration: 4
            });
  			  }
  		  });
  		  Session.set("showUpdateAppointmentDialog", false);
      } else {
        Session.set("updateError", "A title and location is needed to update an event.");
      }
    }
});

Template.updateAppointmentDialog.rendered = function () {
  console.log("rendered update appt");
  $('#txtdescription').wysihtml5();
};


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
	'click #btnFinished' : function (event, template) {
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
		var rating = $(rateid).rateit('value');
		var userRatedAlready = TimeProposals.findOne({"_id" : this._id, "rsvps.email" : Session.get("inviteemail")});
		
		if (userRatedAlready) {
		  TimeProposals.update({"_id" : this._id, "rsvps.email" : Session.get("inviteemail")}, {$set : {"rsvps.$.rating" : rating}});
		} else {
			TimeProposals.update({"_id" : this._id}, {$push : {"rsvps" : {"email" : Session.get("inviteemail"), "rating" : rating}}});
		}
		
		trackVote(Session.get("selected"), Session.get("inviteemail"));
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
              duration: 4
          });
			  } else {
			    showNotification({
              message: error.reason,
              autoClose: true,
              type: "error",
              duration: 8
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
		  Meteor.call("addTimeProposal", Session.get("selected"), {
		    pdate: propDate,
			  ptime: propTime
	  }, function (error) {
		  if (! error) {
			  showNotification({
            message: messages.timeproposalcreate.success,
            autoClose: true,
            type: "success",
            duration: 4
        });
		  } else {
		    showNotification({
            message: error.reason,
            autoClose: true,
            type: "error",
            duration: 8
        });
		  }
	  });
    } else {
		   showNotification({
            message: messages.timeproposalcreate.validation,
            autoClose: true,
            type: "error",
            duration: 8
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

///////////////////////////////////////////////////////////////////////////////
//Utility functions: Analytics
var getAttendeesForAnEvent = function(appintmentId, isInvited) {
  return Attendees.find({"appointmentId" : appintmentId, "invited" : isInvited}).count();
}

var getReadEmails = function(appintmentId, isRead) {
  return Attendees.find({"appointmentId" : appintmentId, "emailread" : isRead}).count();
}

var getClicks = function(appintmentId, hasClicked) {
  return Attendees.find({"appointmentId" : appintmentId, "linkclicked" : hasClicked}).count();
}

var getVotes = function(appintmentId, hasVoted) {
  return Attendees.find({"appointmentId" : appintmentId, "voted" : hasVoted}).count();
}


var buildInvitedAttendeesPieChart = function() {
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

var buildEmailReadPieChart = function() {
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

var buildClicksPieChart = function() {
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

var buildVotesPieChart = function() {
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
