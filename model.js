Appointments = new Meteor.Collection("appointments");
TimeProposals = new Meteor.Collection("timeproposals");
Attendees = new Meteor.Collection("attendees");

if (Meteor.is_client) {
	console.log("Inside client model...");
}

///////////////////////////////////////////////////////////////////////////////
// Mongodb Indexes
if (Meteor.is_server) {
	TimeProposals._ensureIndex({"date" : 1, "time" : 1, "appointmentId" : 1}, {"unique" : true, "sparse" : true});
	Attendees._ensureIndex({"name" : 1, "email" : 1, "appointmentId" : 1}, {"unique" : true, "sparse" : true});
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
	update: function(userId, doc) {
		return true;
	},
	remove: function () {
	  return true;
	}
});

Attendees.allow({
	update: function() {
		return true;
	},
	remove: function () {
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
      description: '',
      proposalType: 1,
      createdDate: new Date(),
      attendees: [],
      rsvps: [],
      timeproposals: []
    });
  },
  
  updateAppointment: function (options) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
    		typeof options.location === "string" && options.location.length))
    throw new Meteor.Error(400, "Required parameter missing.");
    if (options.title.length > 200)
      throw new Meteor.Error(413, "Event title too long.");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to create events.");
    
      Appointments.update({"_id" : options.id}, {$set : {"title" : options.title, "location" : options.location, "description" : options.description, "proposalType" : options.proposalType}});
  },
  
  sendOneInvite: function (options) {
    var appointment = Appointments.findOne(options.appointmentid);
    if (! appointment || appointment.owner !== this.userId)
      throw new Meteor.Error(404, "No such event.");
      /*
    if (userId !== appointment.owner && ! _.contains(party.invited, userId)) {
      Parties.update(partyId, { $addToSet: { invited: userId } });
      */
      
      var user = Meteor.users.findOne(this.userId);
      var from = contactEmail(user);
      var fromName = displayName(user);
      var to = options.toemail;
      if (Meteor.isServer && to) {
        // This code only runs on the server. If you didn't want clients
        // to be able to see it, you could move it to a separate file.
        Email.send({
          from: "noreply@maria-app.com",
          to: to,
          replyTo: from || undefined,
          subject: "Event: " + appointment.title,
          text: "Dear " + options.toname + ",\n\n This is Maria, your friendly meeting assistant.\n\n On behalf of " + fromName + ", I\'d like to invite you to the event '" + appointment.title + "'." + "\n\nThe event organizer has created a quick poll with several time proposals. Please visit this link to RSVP and cast your vote for the best time for the event.\n\n " + Meteor.absoluteUrl("invite/" + appointment._id + "/" + to, {"rootUrl" : "http://maria-app.herokuapp.com"}) + "\n\nThank you for your time,\n--Maria\n\nwww.maria-app.herokuapp.com"
        });
    }
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
  
  updateTimeProposal: function (options) {
	  options = options || {};
    if (! (typeof options.date === "string" && options.date.length &&
	    typeof options.time === "string" && options.time.length))
	       throw new Meteor.Error(400, "Required parameter missing.");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to add time proposals.");
	   
	    TimeProposals.update({"_id" : options.id}, {$set : {"date" : options.date, "time" : options.time}});
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
	    "invited": false,
	    "voted" : false
	  });
  },
  
  updateAttendee: function (options) {
 	  options = options || {};
     if (! (typeof options.name === "string" && options.name.length &&
 	    typeof options.email === "string" && options.email.length))
 	       throw new Meteor.Error(400, "Required parameter missing.");
     if (! this.userId)
       throw new Meteor.Error(403, "You must be logged in to add time proposals.");

 	    Attendees.update({"_id" : options.id}, {$set : {"name" : options.name, "email" : options.email}});
   },
});

///////////////////////////////////////////////////////////////////////////////
// Users

var displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

var contactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
};