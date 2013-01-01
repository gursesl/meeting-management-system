DeployLogs = new Meteor.Collection("deploylogs");
Appointments = new Meteor.Collection("appointments");
AnonymousAppointments = new Meteor.Collection("anonymousappointments");
TimeProposals = new Meteor.Collection("timeproposals");
Attendees = new Meteor.Collection("attendees");

///////////////////////////////////////////////////////////////////////////////
// Mongodb Indexes
if (Meteor.is_server) {
  
  //Date and time should be unique for a given event
	TimeProposals._ensureIndex({"date" : 1, "time" : 1, "appointmentId" : 1}, {"unique" : true, "sparse" : true});
	
	//For a given event, allow oly unique email addresses
	Attendees._ensureIndex({"email" : 1, "appointmentId" : 1}, {"unique" : true, "sparse" : true});
	
	//Ensure one revision and deployment date
	DeployLogs._ensureIndex({"lastdeployed" : 1, "revision" : 1}, {"unique" : true, "sparse" : true});
	
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
    if (Meteor.is_server) {
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
      description: options.description,
      anonymous: options.anonymous,
      proposalType: 1,
      createdDate: new Date(),
      attendees: [],
      rsvps: [],
      timeproposals: []
    });
  }
  },
  
  updateAppointment: function (options) {
    if (Meteor.is_server) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
    		typeof options.location === "string" && options.location.length))
    throw new Meteor.Error(400, "Required parameter missing.");
    if (options.title.length > 200)
      throw new Meteor.Error(413, "Event title too long.");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to create events.");
    
      Appointments.update({"_id" : options.id}, {$set : {"title" : options.title, "location" : options.location, "description" : options.description, "proposalType" : options.proposalType}});
    }
  },
  
  createAnonymousAppointment: function (options) {
    if (Meteor.is_server) {
    options = options || {};
    if (! (typeof options.title === "string" && options.title.length &&
    		typeof options.location === "string" && options.location.length))
    throw new Meteor.Error(400, "Required parameter missing.");
    if (options.title.length > 200)
      throw new Meteor.Error(413, "Event title too long.");
    
    return AnonymousAppointments.insert({
      linkid: Meteor.uuid(),
      title: options.title,
      location: options.location,
      description: options.description,
      proposalType: 1,
      createdDate: new Date(),
      attendees: [],
      rsvps: [],
      timeproposals: []
    });
  }
  },
  
  sendOneInvite: function (options) {
    if (Meteor.is_server) {
      var appointment = Appointments.findOne(options.appointmentid);
      if (! appointment || appointment.owner !== this.userId)
        throw new Meteor.Error(404, "No such event.");
      
      var user = Meteor.users.findOne(this.userId);
      var from = contactEmail(user);
      var fromName = displayName(user);
      var to = options.toemail;
      var pixelTrackerLink = "<img src='" + Meteor.absoluteUrl("tracking/" + appointment._id + "/" + to) + "' width='1' height='1'>";
      var inviteLink = "<a href='" + Meteor.absoluteUrl("invite/" + appointment._id + "/" + to) + "'>" + Meteor.absoluteUrl("invite/" + appointment._id + "/" + to) + "</a>";
      if (Meteor.isServer && to) {
        // This code only runs on the server. If you didn't want clients
        // to be able to see it, you could move it to a separate file.
        Email.send({
          from: "noreply@maria-app.com",
          to: to,
          replyTo: from || undefined,
          subject: "[Maria] Vote for Event: " + appointment.title,
          html: "<html><body>Dear <strong>" + options.toname + "</strong>,<br><br> This is Maria, the world's quickest online meeting organizer.<br><br> On behalf of " + fromName + ", I\'d like to invite you to the event <strong>" + appointment.title + "</strong>.<br><br>The event organizer has created a quick poll with several time proposals. Please visit this link to RSVP and cast your vote for the best time for the event.<br><br> " + inviteLink + "<br><br>Thank you for your time,<br>--Maria<br><br>" + Meteor.absoluteUrl() + "<br>" + pixelTrackerLink + "<br><br></body></html>"
          //, text: "Dear " + options.toname + ",\n\n This is Maria, your friendly meeting assistant.\n\n On behalf of " + fromName + ", I\'d like to invite you to the event '" + appointment.title + "'." + "\n\nThe event organizer has created a quick poll with several time proposals. Please visit this link to RSVP and cast your vote for the best time for the event.\n\n " + Meteor.absoluteUrl("invite/" + appointment._id + "/" + to, {"rootUrl" : "http://maria-app.herokuapp.com"}) + "\n\nThank you for your time,\n--Maria\n\nwww.maria-app.herokuapp.com"
        });
        
        console.log("Email sent successfully.");
        
        var found = Attendees.findOne({"email" : to, "appointmentId" : appointment._id});
        if (! found) {
          throw new Meteor.Error(400, "Event cannot be found or user not invited.");
        } else {
  	      Attendees.update({"email" : to, "appointmentId" : appointment._id}, {$set : {"invited" : true, "emailread" : false}});
	      }
      }
    }
  },
  
  addTimeProposal: function (appointment, options) {
    if (Meteor.is_server) {
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
	    }, function (error) {
  		    if (! error) {
  			    console.log("Time proposal added successfully.");
			    } else {
  			      if (error.code == "11000") {
  			        throw new Meteor.Error(403, "Time proposal date and time must be unique. Please check the existing proposal and choose a diffrent date or time.");
			        } else {
  			        throw new Meteor.Error(403, "System Error.");
			        }
  			    console.log(error);
			    }
      });
    }
  },
  
  updateTimeProposal: function (options) {
    if (Meteor.is_server) {
	  options = options || {};
    if (! (typeof options.date === "string" && options.date.length &&
	    typeof options.time === "string" && options.time.length))
	       throw new Meteor.Error(400, "Required parameter missing.");
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to add time proposals.");
	   
	    TimeProposals.update({"_id" : options.id}, {$set : {"date" : options.date, "time" : options.time}});
    }
  },
  
  addAttendee: function(appointment, options) {
    if (Meteor.is_server) {
	    options = options || {};
	    if (! (typeof options.name === "string" && options.name.length &&
	      typeof options.email === "string" && options.email.length))
	        throw new Meteor.Error(400, "Required parameter missing.");
	    if (! this.userId)
	        throw new Meteor.Error(403, "You must be logged in to attendees.");
	  
	    Attendees.insert({
	      "appointmentId": appointment, 
	      "owner": this.userId, 
	      "name": options.name, 
	      "email": options.email,
	      "invited": false,
	      "voted" : false,
	      "emailread" : false,
	      "linkclicked" : false
	    }, function (error) {
    		    if (! error) {
    			    console.log("Attendee added successfully.");
  			    } else {
    			      if (error.code == "11000") {
    			        throw new Meteor.Error(403, "Attendee emails must be unique. Please check the existing attendees or choose a diffrent email address.");
  			        } else {
    			        throw new Meteor.Error(403, "System Error.");
  			        }
    			    console.log(error);
  			    }
        });
      }
  },
  
  updateAttendee: function (options) {
    if (Meteor.is_server) {
 	    options = options || {};
      if (! (typeof options.name === "string" && options.name.length &&
 	      typeof options.email === "string" && options.email.length))
 	       throw new Meteor.Error(400, "Required parameter missing.");
      if (! this.userId)
        throw new Meteor.Error(403, "You must be logged in to add time proposals.");

 	    Attendees.update({"_id" : options.id}, {$set : {"name" : options.name, "email" : options.email}});
    }
  },

  //TODO: Code Duplication -- Refactor THIS!!!
  updateAttendeeEmailReceipt: function (options) {
    if (Meteor.is_server) {
      options = options || {};
      if (! (typeof options.appointmentId === "string" && options.appointmentId.length &&
  	    typeof options.email === "string" && options.email.length))
  	       throw new Meteor.Error(400, "Required parameter missing.");
        
        var found = Attendees.findOne({"email" : options.email, "appointmentId" : options.appointmentId});
        if (! found) {
          throw new Meteor.Error(400, "Event cannot be found or the user has not been invited.");
        } else {
  	      Attendees.update({"email" : options.email, "appointmentId" : options.appointmentId}, {$set : {"emailread" : true}});
	      }
      }
   },

  //TODO: Code Duplication -- Refactor THIS!!!   
   updateAttendeeClickInviteLink: function (options) {
     if (Meteor.is_server) {
       options = options || {};
       if (! (typeof options.appointmentId === "string" && options.appointmentId.length &&
   	    typeof options.email === "string" && options.email.length))
   	       throw new Meteor.Error(400, "Required parameter missing.");

         var found = Attendees.findOne({"email" : options.email, "appointmentId" : options.appointmentId});
         if (! found) {
           throw new Meteor.Error(400, "Event cannot be found or the user has not been invited.");
         } else {
   	      Attendees.update({"email" : options.email, "appointmentId" : options.appointmentId}, {$set : {"linkclicked" : true}});
 	      }
       }
    },
    
    //TODO: Code Duplication -- Refactor THIS!!!
    updateAttendeeVoteTracking: function (options) {
       if (Meteor.is_server) {
         options = options || {};
         if (! (typeof options.appointmentId === "string" && options.appointmentId.length &&
     	    typeof options.email === "string" && options.email.length))
     	       throw new Meteor.Error(400, "Required parameter missing.");

           var found = Attendees.findOne({"email" : options.email, "appointmentId" : options.appointmentId});
           if (! found) {
             throw new Meteor.Error(400, "Event cannot be found or the user has not been invited.");
           } else {
     	       Attendees.update({"email" : options.email, "appointmentId" : options.appointmentId}, {$set : {"voted" : true}});
   	      }
         }
      }
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