
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

  Template.appointments.events({
    'input input.event_search_box' : function () {
	   if (document.getElementsByName('find_event')[0].value != null | document.getElementsByName('find_event')[0].value != "") {
	     Session.set("eventname", document.getElementsByName('find_event')[0].value);
	   } else {
		  Session.set("eventname", null);
	   }
	   console.log("Input search typed...");
	},
	'click input.reset': function () {
		document.getElementsByName('find_event')[0].value="";
		Session.set("eventname", null);
		console.log("Reset button clicked...");
	}
  });
	
  Template.appointment.events({
    'click #btnMsgDelete' : function(event, template) {
    	console.log ("Deleting appointment with ID: " + this._id);
    	Appointments.remove(this);
    }
  });
  
  //Template.newappointment.events = {};
  Template.newappointment.events({
	  'click #btnSend': function (event, template) {
		  var nameEntry = template.find("#title").value;
		  var msgEntry = template.find("#location").value;
		  if (nameEntry.value != "" && msgEntry != "") {
			  console.log ("Title: " + nameEntry);
			  console.log ("Location: " + msgEntry);
			  var ts = Date.now() / 1000;
			  Appointments.insert({title: nameEntry, location: msgEntry, time: ts});
		  }
	  },
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
  
  Template.appointments.appointments = function () {
    if (Session.get("eventname") != null && Session.get("eventname") != "") {
	  var regex = new RegExp(Session.get("eventname"), "i");
	    return Appointments.find({title: regex}, { sort: {time: -1}});
    } else {
	  return Appointments.find({}, {sort: {time: -1}});
    }
  }
  
  Template.appointmentdetail.selected_apt = function () {
    var appointment = Appointments.findOne(Session.get("selected_apt"));
    return appointment;
  };
  
  Template.appointment.selected = function () {
    return Session.equals("selected_apt", this._id) ? "selected" : '';
  };
  
  Template.appointment.events({
    'click': function () {
    Session.set("selected_apt", this._id);
    }
  });

