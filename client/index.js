"use strict";

///////////////////////////////////////////////////////////////////////////////
//Data subscriptions 
Meteor.subscribe("directory");
Meteor.subscribe("appointments");
Meteor.subscribe("timeproposals");
Meteor.subscribe("attendees");
Meteor.subscribe("deploylogs");

///////////////////////////////////////////////////////////////////////////////
//Router 

Meteor.Router.add({
  '/'						    : 'homepage',
  "/dashboard"      : 'dashboard',
  '/why'				    : 'why',
  '/tour'				    : 'tour',
  '/pricing'				: 'pricing',
  '/terms'			    : 'terms',
  '/privacy'		    : 'privacy',
  '/signup'		      : 'signup',
  '/invite/:id/:email'	: function (id, email) {
    //console.log("invite router on the client");
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
          $.pnotify({
            title: 'Success',
            text: messages.voting.success,
            type: 'success'
          });
        } else {
          console.log(error.reason);
          $.pnotify({
            title: 'Error',
            text: messages.voting.error,
            type: 'error'
          });
        }
    });
  }
}

///////////////////////////////////////////////////////////////////////////////
//Start-up
Meteor.startup(function () {
  //console.log("client startup");
    
  Meteor.autorun(function () {
    //console.log("client autorun");
    
	  if (Meteor.userId()) {
      if (! Session.get("selected")) {
        var appointment = Appointments.findOne({"owner": Meteor.userId()}, {sort: {time: -1}});
        if (appointment) {
          Session.set("selected", appointment._id);
  	    }
	    }
	  }
  });
});

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
          $.pnotify({
            title: 'Success',
            text: messages.eventcreate.success,
            type: 'success'
          });

				  Session.set("selected", appointment);
				  openUpdateAppointmentDialog();
			  } else {
          $.pnotify({
            title: 'Error',
            text: messages.eventcreate.error,
            type: 'error'
          });
			  }
		  });
		  Session.set("showCreateDialog", false);
		  } else {
          $.pnotify({
            title: 'Validation Error',
            text: messages.eventcreate.validation,
            type: 'error'
          });
		  }
	  }
  });
  
  /*
  Template.newappointment.events[okcancel_events('#location')] = make_okcancelhandler({
    ok: function (text, event) {
      var nameEntry = document.getElementById('title');
      if (nameEntry.value != "") {
        var ts = Date.now() / 1000;
        Appointments.insert({title: nameEntry.value, location: text, time: ts});
        event.target.value = "";
      }
    }
  }); */


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
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Time proposal
Template.timeproposal.events({
  'click #linkDeleteTimeProposal' : function (event, template) {
		TimeProposals.remove(this._id);
		$.pnotify({
      title: 'Success',
      text: messages.timeproposaldelete.success,
      type: 'success'
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
  // TODO: Fix this shit
  /*
  $('#txtNewPropsalDate').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: true,
    autoclose: true
  }); */
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
        $.pnotify({
          title: 'Success',
          text: messages.timeproposalsave.success,
          type: 'success'
        });
		  }
	  });
	  Session.set("edittimeproposal", false);
    Session.set("selectedtimeproposal", null);
  } else {
      $.pnotify({
        title: 'Error',
        text: messages.timeproposalsave.error,
        type: 'error'
      });
  }
}

///////////////////////////////////////////////////////////////////////////////
//Template: Landing slider
Template.landing.events({
  'click .linkhome' : function (event, template) {
    slideHomePageWizard(event, template, event.currentTarget.id);
  } 
});

Template.landing.rendered = function () {
  
  $(".lovegrid").gridalicious({
    gutter: 20,
    width: 200,
    animate: true, 
      animationOptions: { 
        speed: 1000,
        duration: 1500
        },
  });

  $(window).scroll(function () {
     if ($(window).scrollTop() >= $(document).height() - $(window).height() - 300) {
        $(".lovegrid").gridalicious('append', makeboxes());
     }
  });
  
}

var makeboxes = function() {
  var count = Session.get("boxcount");
  if (count == null) 
    count = 0;
    
  var boxes = new Array;
  var amount = Math.floor(Math.random()*10);
  if (amount == 0) amount = 1;
   
  // Number of circles to add
  var numCircles = 0;
  if (count < numCircles) {
    var div = $('<li></li>').addClass('item');
    var p = "<div class=\"ch-item ch-img-" + (count+3) + "\"></div>";
    div.append(p);
    boxes.push(div);
    count = count + 1;
    Session.set("boxcount", count);
  }
    
  return boxes;
}

///////////////////////////////////////////////////////////////////////////////
//Template: Header

Template.header.events({
  'click .linkhome' : function (event, template) {
    var step = event.currentTarget.id;
    Session.set("keepview", step);
    slideHomePageWizard(event, template, step);
  }
});

Template.header.isuser = function() {
  return Template.homepage.isuser;
}

Template.header.rendered = function (event, template) {
  //console.log("header rendering");
  // TODO: Fix this shit
  //resetWizard(Session.get("keepview"));
  //resetWizard(Session.get("keepview"));
}

///////////////////////////////////////////////////////////////////////////////
//Template: Footer
Template.footer.lastdeployed = function (event, template) {
  if (DeployLogs.findOne()) {
    return DeployLogs.findOne().lastdeployed;
  }
}

Template.footer.revision = function (event, template) {
    if (DeployLogs.findOne()) {
      return DeployLogs.findOne().revision;
    }
}

///////////////////////////////////////////////////////////////////////////////
//Template: Update appointment
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
      // Hide modal
      $('#updateAppointmentModal').modal('hide');
      // Hack to remove modal class from body
      $('body').removeClass( "modal-open" );
      
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
            $.pnotify({
              title: 'Success',
              text: messages.eventsave.success,
              type: 'success'
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
  //console.log("rendered update appt");
  // TODO: Fix this shit
  //$('#txtdescription').wysihtml5();
  //$('#updateAppointmentModal').modal('show');
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
          $.pnotify({
              title: 'Success',
              text: messages.attendeecreate.success,
              type: 'success'
            });
			  } else {
          $.pnotify({
              title: 'Error',
              text: error.reason,
              type: 'error'
            });
			  }
	    });
	  } else {
      $.pnotify({
        title: 'Error',
        text: messages.attendeecreate.error,
        type: 'error'
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