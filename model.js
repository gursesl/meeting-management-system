Appointments = new Meteor.Collection('appointments');

Appointments.allow({
  insert: function (userId, appointment) {
    return false; // no cowboy inserts -- use createAppointment method
  },
  remove: function (userId, appointment) {
	return ! appointment.owner != userId;
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
      invited: [],
      rsvps: [],
      timeproposals: []
    });
  },
  
  addTimeProposal: function (appointment, options) {
	  console.log("Model: adding time proposal...");
	  options = options || {};
	    if (! (typeof options.pdate === "string" && options.pdate.length &&
	    		typeof options.ptime === "string" && options.ptime.length))
	       throw new Meteor.Error(400, "Required parameter missing.");
	    if (! this.userId)
	      throw new Meteor.Error(403, "You must be logged in to add time proposals.");
	    
	   Appointments.update( appointment, {$push : {"timeproposals" : {"date" : options.pdate, "time": options.ptime, "votes":0}}});
  }
});