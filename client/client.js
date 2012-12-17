///////////////////////////////////////////////////////////////////////////////
//Data subscriptions 
Meteor.subscribe("directory");
Meteor.subscribe("appointments");
Meteor.subscribe("timeproposals");
Meteor.subscribe("attendees");

//If no party selected, select one.
Meteor.startup(function () {
  Meteor.autorun(function () {
    if (! Session.get("selected")) {
      var appointment = Appointments.findOne();
      if (appointment)
        Session.set("selected", appointment._id);
    }
  });
});

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

  Template.page.events({
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
  Router.setEvent(Session.get("selected"));
  return Session.equals("selected", this._id) ? "selected" : '';
};
  
Template.appointment.events({
  'click': function () {
   Session.set("selected", this._id);
  },
  'click #btnMsgDelete' : function(event, template) {
  	console.log ("Deleting appointment with ID: " + this._id);
  	Appointments.remove(this._id);
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
  var appointment = Appointments.findOne(Session.get("selected"));
  return appointment;
};
  
Template.appointmentdetail.events({
  'click #btnAddTimeProposal': function (event, template) {
    var propDate = template.find("#proposalDate");
    var propTime = template.find("#proposalTime");
    console.log("Date: " + propDate.value);
    console.log("Time: " + propTime.value);
  },
  'click #btnTimeProposals': function( event, template) {
    openTimeProposalsDialog();
  },
  'click #btnAttendees': function (event, template) {
    openAttendeesDialog();
  },
  'click .apttitle': function(event, template) {
	  Router.setEvent(Session.get("selected"));
  }
});
  
///////////////////////////////////////////////////////////////////////////////
//Attendees dialog
var openAttendeesDialog = function () {
  Session.set("showAttendeesDialog", true);
};

Template.page.showAttendeesDialog = function () {
  return Session.get("showAttendeesDialog");
};

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
	  }
	},
	'click .done': function (event, template) {
	    Session.set("showAttendeesDialog", false);
	    return false;
	  } 
});
	
///////////////////////////////////////////////////////////////////////////////
//Time proposals dialog 
var openTimeProposalsDialog = function () {
  Session.set("showTimeProposalsDialog", true);
};

Template.page.showTimeProposalsDialog = function () {
  return Session.get("showTimeProposalsDialog");
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
    }
  },
  'click .done': function (event, template) {
    Session.set("showTimeProposalsDialog", false);
    //Session.set("showAttendeesDialog", true);
    return false;
  }
});