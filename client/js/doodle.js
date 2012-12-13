
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

  Template.appointment.events({
    'click #btnMsgDelete' : function(event, template) {
    	console.log ("Deleting appointment with ID: " + this._id);
    	Appointments.remove(this);
    }
  });
  
  //Template.entry.events = {};
  Template.entry.events({
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
  
  
  Template.entry.events[okcancel_events('#location')] = make_okcancelhandler({
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
	  return Appointments.find({}, { sort: {time: -1}});
  }
