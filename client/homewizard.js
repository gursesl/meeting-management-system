"use strict";
    
///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Login
Template.homewizlogin.events({
  'click #login-buttons-password' : function( event, template ) {
    var email = template.find("#login-email").value;
    var password = template.find("#login-password").value;
    
    Meteor.loginWithPassword(email, password, function (error) {
      if (! error) {
        // Dome something useful
      } else {
        // Throw an error
      }
    })
  }
});



///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step One
Template.homewizone.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    slideHomePageWizard(event, template);
  },
  
  'click #next' : function ( event, template ) {
    // Read form variables
    var title = template.find("#txtTitle").value;
    var location = template.find("#txtLocation").value;
    var desc = template.find("#txtDescription").value;
    
    //Validation
    if ( validateHomeWizOne( title, location ) ) {
      // Set session variables
      Session.set("wiztitle", title);
      Session.set("wizlocation", location);
      Session.set("wizdecription", desc);
      
      // Keep next view open
      Session.set("keepview", "two");
      
      // Transition
      transition("one", "two");
    } else {
      showNotification({
          message: messages.eventcreate.validation,
          autoClose: true,
          type: "error",
          duration: 4
      });
    }
  }
});

Template.homewizone.rendered = function () {
  // Add HTML5 input patterns
  $('#txtTitle').attr("pattern", patterns.title);
  $('#txtLocation').attr("pattern", patterns.location);
}

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Two (Add Time Proposals)
Template.homewiztwo.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    Session.set("keepview", null);
    transition("two", "one");
  },
  
  'click #next' : function ( event, template ) {
    Session.set("keepview", "three");
    transition ( "two", "three" );
  },
  
  'click #add' : function (event, template) {
    var date = template.find("#txtDate").value;
    var time = template.find("#txtTime").value;
    
    if (validateDateTime(date, time)) {
      var timeproposal = new TimeProposal(date, time);
      var propArray = Session.get("homewiztimeproposals");
    
      if (!propArray) {
        propArray = new Array();
      }
     
      propArray.push(timeproposal);
      Session.set("homewiztimeproposals", propArray);
      Session.set("keepview", "two");
    } else {
      showNotification({
          message: messages.timeproposalcreate.validation,
          autoClose: true,
          type: "error",
          duration: 4
      });
    }
  },
  
  'click .del' : function ( event, template ) {
    var propArray = Session.get("homewiztimeproposals");
    var victimId = this.id;
    if (propArray) {
      $.each(propArray, function(index, value) {
        if (value.id == victimId) {
          // Remove the victim time proposal from array
          propArray.splice(index, 1);
          Session.set("homewiztimeproposals", propArray);
          Session.set("keepview", "two");
        }
      });
    }
  }
});

Template.homewiztwo.rendered = function () {
  // Render datepicker
  $('#txtDate').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: true,
    autoclose: true
  });
  
  // Render timepicker
  $('#txtTime').timepicker({ 'scrollDefaultNow': true });
  
  // Add HTML5 input patterns
  $('#txtDate').attr("pattern", patterns.date);
  $('#txtTime').attr("pattern", patterns.time);
}


///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Three (Add Attendees)
Template.homewizthree.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    Session.set("keepview", "two");
    transition("three", "two");
  },
  
  'click #next' : function ( event, template ) {
    Session.set("keepview", "four");
    transition ( "three", "four" );
  },
  
  'click #add' : function (event, template) {
    var name = template.find("#txtName").value;
    var email = template.find("#txtEmail").value;
    
    if (validateNameAndEmail(name, email)) {
      var attendee = new Attendee (name, email);
      var atArray = Session.get("homewizattendees");
    
      if (!atArray) {
        atArray = new Array();
      }
     
      atArray.push(attendee);
      Session.set("homewizattendees", atArray);
      Session.set("keepview", "three");
    } else {
      showNotification({
          message: messages.attendeecreate.validation,
          autoClose: true,
          type: "error",
          duration: 4
      });
    }
  },
  
  'click .del' : function ( event, template ) {
    var atArray = Session.get("homewizattendees");
    var victimId = this.id;
    if (atArray) {
      $.each(atArray, function ( index, value ) {
        if (value.id == victimId) {
          // Remove the victim time proposal from array
          atArray.splice(index, 1);
          Session.set("homewizattendees", atArray);
          Session.set("keepview", "three");
        }
      });
    }
  }
});

Template.homewizthree.rendered = function () {
  // Add HTML5 input patterns
  $('#txtName').attr("pattern", patterns.fullname);
  $('#txtEmail').attr("pattern", patterns.email);
}



///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Four (Send Invitations)
Template.homewizfour.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("four", "three");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "four", "five" );
  },
  
  'click .addevent' : function ( event, template ) {
    transition("four", "one");
  },
  
  'click .addtp' : function ( event, template ) {
    transition("four", "two");
  },
  
  'click .addattendees' : function ( event, template ) {
    transition("four", "three");
  }
  
});

Template.homewizfour.attendees = function () {
  return Template.homewizthree.attendees;
}

Template.homewizfour.timeproposals = function () {
  return Template.homewiztwo.timeproposals;
}


Template.homewizfour.eventlink = function () {
  return generateShortHash();
}


///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Five
Template.homewizfive.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("five", "four");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "five", "six" );
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Six
Template.homewizsix.events({
  'click #cancel' : function ( event, template ) {
    Session.set("keepview", null);
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("six", "five");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "six", null );
  }
});

// Transition between two steps in homepage wizard
var transition = function ( fromStep, toStep ) {

  var fromstep = "#homewiz" + fromStep;
  var tostep = "#homewiz" + toStep;
  
  var fromsession = "wiz" + fromStep;
  var tosession = "wiz" + toStep;
  
  var frombutton = "#li" + fromStep;
  var tobutton = "#li" + toStep;
  
  
  Session.set(fromsession, null);
  Session.set(tosession, true);
  
  $(fromstep).css({"height" : "0px"});
  $(fromstep).css({"opacity" : "0"});

  $(tostep).css({"height" : "400px"});
  $(tostep).css({"opacity" : "1"});
  
  // Buttons
  $(tobutton).addClass("selected");
  $(tobutton + " .ca-icon").addClass("selected");
  $(tobutton + " .ca-main").addClass("selected");
  
  $(frombutton).removeClass("selected");
  $(frombutton + " .ca-icon").removeClass("selected");
  $(frombutton + " .ca-main").removeClass("selected");
}

var resetWizard = function ( step ) {
  console.log ("reset wizard");
  _.each(["one", "two", "three", "four", "five", "six"], function (element) {
    
    // Reset session vars
    Session.set("wiz" + element, null);
    
    // Reset div heights
    transition( element, null );
  });
  
  if ( step != null ) {
    console.log("found keepview: " + step);
    transition (null, step);
  }
}