"use strict";

///////////////////////////////////////////////////////////////////////////////
//Data subscriptions 
Meteor.subscribe("directory");
Meteor.subscribe("appointments");
Meteor.subscribe("timeproposals");
Meteor.subscribe("attendees");

///////////////////////////////////////////////////////////////////////////////
//Router 

Meteor.Router.add({
    '/'						: 'homepage',
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
      console.log(appointment);
      if (appointment) {
        console.log("Startup: found appointment id " + appointment._id);
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
	}
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
				  console.log("Created successfully..." + appointment);
				  Session.set("selected", appointment);
				  openTimeProposalsDialog();
			  }
		  });
		  Session.set("showCreateDialog", false);
		  } else {
			  Session.set("createError", "A title and location is needed to create a new event.");
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
//Template: Appointment
Template.appointment.selected = function () {
  //Router.setEvent(Session.get("selected"));
  return Session.equals("selected", this._id) ? "selected" : '';
};
  
Template.appointment.events({
  'click': function () {
   Session.set("selected", this._id);
  },
  'click #btnMsgDelete' : function(event, template) {
  	console.log ("Deleting appointment with ID: " + this._id);
  	Appointments.remove(this._id);
  	Session.set("selected", null);
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
  
Template.appointmentdetail.events({
  'click #btnTimeProposals': function( event, template) {
    openTimeProposalsDialog();
  },
  'click #btnAttendees': function (event, template) {
    openAttendeesDialog();
  },
  'click .apttitle': function(event, template) {
	  //Router.setEvent(Session.get("selected"));
  }
});
  
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
//Homepage template
Template.homepage.showTimeProposalsDialog = function () {
  return Session.get("showTimeProposalsDialog");
};

Template.homepage.showAttendeesDialog = function () {
  return Session.get("showAttendeesDialog");
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
				  console.log("Attendee added successfully...");
			  }
	    });
	  } else {
		  Session.set("createError", "You need to enter attendee name and email address.");
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
			  console.log("Time proposal added successfully...");
		  }
	  });
    } else {
		  Session.set("createError", "You need to enter a proposed date and time.");
	  }
  },
  'click .done': function (event, template) {
    Session.set("showTimeProposalsDialog", false);
    //Session.set("showAttendeesDialog", true);
    return false;
  }
});

Template.timeProposalsDialog.error = function() {
  return Session.get("createError");	
};