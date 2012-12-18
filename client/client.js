///////////////////////////////////////////////////////////////////////////////
//Router 

Meteor.Router.add({
    '/': 'homepage',
    '/welcome'		: 'welcome',
    '/features'		: 'features',
    '/posts/:id': function(id) {
      Session.set('postId', id);
      return 'post';
  },
    '/invite/:id/:email'	: function (id) {
    	var appointment = Appointments.findOne(this.params["id"]);
    	if (appointment) {
    		Session.set("selected", appointment._id);
    		Session.set("appointment", appointment);
    	}
    	
    	Session.set("inviteemail", this.params["email"]);
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
//Data subscriptions 
Meteor.subscribe("directory");
Meteor.subscribe("appointments");
Meteor.subscribe("timeproposals");
Meteor.subscribe("attendees");

///////////////////////////////////////////////////////////////////////////////
//Startup 
Meteor.startup(function () {
  Meteor.autorun(function () {
    if (! Session.get("selected")) {
      var appointment = Appointments.findOne();
      if (appointment)
        Session.set("selected", appointment._id);
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
  return Appointments.find({"owner": this.userId}).count() > 0;
};
	
Template.dashboard.appointments = function () {
  if (Session.get("eventname") != null && Session.get("eventname") != "") {
    var regex = new RegExp(Session.get("eventname"), "i");
      return Appointments.find({title: regex}, { sort: {time: -1}});
  } else {
	  return Appointments.find({}, {sort: {time: -1}});
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

///////////////////////////////////////////////////////////////////////////////
//Template: Invite time proposal
Template.invitetimeproposal.events({
	'click #btnVoteTimeProposal': function(event, template) {
		console.log("Proposal id voted: " + this._id);
		TimeProposals.update(this._id, {$inc: {votes: 1}});
	}
});

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