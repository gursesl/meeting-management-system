(function () {

  Meteor.Router.add('/404', [404, "Page not found!"]);
  
  Meteor.Router.add({'/tracking/:eventid/:email'  : function (eventid, email) {
      trackEmailReceipt(eventid, email);
    }
  });
  
  ///////////////////////////////////////////////////////////////////////////////
  //Tracking
  var trackEmailReceipt = function (appointmentid, email) {
    console.log("Email read receipt for event " + appointmentid + " and email " + email);
    if (appointmentid.length && email.length) {
      Meteor.call("updateAttendeeEmailReceipt", {
        appointmentId: appointmentid,
        email: email
        }, function (error) {
  		    if (! error)
  			    console.log("Tracking updated successfully.");
  			  else
  			    console.log(error.reason);
      });
    }
  }

  Meteor.publish("directory", function () {
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
  });

  Meteor.publish("appointments", function () {
    return Appointments.find({}, {sort: {createdDate: -1, title: 1}});
  });

  Meteor.publish("timeproposals", function () {
	  return TimeProposals.find({}, {sort : {"votes": 1}});
  });

  Meteor.publish("attendees", function () {
	  return Attendees.find({owner: this.userId});
  });

  Meteor.startup(function () {
    process.env.MAIL_URL = 'smtp://info%4064clicks.com:passw0rd@smtp.gmail.com:465';
  });

}) ();

