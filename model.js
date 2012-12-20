Appointments = new Meteor.Collection("appointments");
TimeProposals = new Meteor.Collection("timeproposals");
Attendees = new Meteor.Collection("attendees");

if (Meteor.is_client) {
	console.log("Inside client model...");
}

if (Meteor.is_server) {
	console.log("Inside server model...");
	TimeProposals._ensureIndex({"date" : 1, "time" : 1}, {"unique" : true, "sparse" : true});
}

Appointments.allow({
  insert: function (userId, appointment) {
    return false; // no cowboy inserts -- use createAppointment method
  },
  remove: function (userId, appointment) {
	return ! appointment.owner != userId;
  },
  update: function (userId, appointment) {
    return ! appointment.owner != userId;
  }
});

TimeProposals.allow({
	'update': function(userId, doc) {
		return true;
	}
});

Meteor.methods({
  createAppointment: function (options) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
    		typeof options.location === "string" && options.location.length))
    throw new Meteor.Error(400, "Required parameter missing.");
    if (options.title.length > 200)
      throw new Meteor.Error(413, "Event title too long.");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to create events.");
    
    return Appointments.insert({
      owner: this.userId,
      title: options.title,
      location: options.location,
      createdDate: new Date(),
      attendees: [],
      rsvps: [],
      timeproposals: []
    });
  },
  
  addTimeProposal: function (appointment, options) {
	  options = options || {};
	    if (! (typeof options.pdate === "string" && options.pdate.length &&
	    		typeof options.ptime === "string" && options.ptime.length))
	       throw new Meteor.Error(400, "Required parameter missing.");
	    if (! this.userId)
	      throw new Meteor.Error(403, "You must be logged in to add time proposals.");
	   
	    TimeProposals.insert({
	    	"appointmentId": appointment, 
	    	"owner": this.userId, 
	    	"date": options.pdate, 
	    	"time": options.ptime, 
	    	"votes": 0,
	    	"rsvps": []
	    });
	   //Appointments.update( appointment, {$push : {"timeproposals" : {"date" : options.pdate, "time": options.ptime, "votes":0}}});
  },
  
  addAttendee: function(appointment, options) {
	  options = options || {};
	  if (! (typeof options.name === "string" && options.name.length &&
	    		typeof options.email === "string" && options.email.length))
	       throw new Meteor.Error(400, "Required parameter missing.");
	    if (! this.userId)
	      throw new Meteor.Error(403, "You must be logged in to add time proposals.");
	  
	  Attendees.insert({
	    "appointmentId": appointment, 
	    "owner": this.userId, 
	    "name": options.name, 
	    "email": options.email,
	    "invited": false
	  });
  }
});
