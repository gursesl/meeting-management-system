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
    slideHomePageWizard(event, template);
  },
  
  'click #next' : function ( event, template ) {

    // Read form variables
    var title = template.find("#txtTitle").value;
    var location = template.find("#txtLocation").value;
    var desc = template.find("#txtDescription").value;
    
    //Validation
    if (validateHomeWizOne(title, location)) {
      // Set session variables
      Session.set("wiztitle", title);
      Session.set("wizlocation", location);
      Session.set("wizdecription", desc);
      
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
    
    
    
    /*  
    if (title.length && location.length) {
			  Meteor.call("createAnonymousAppointment", {
				title: title,
				location: location,
				description: desc
		  }, function (error, appointment) {
			  if (! error) {
				  showNotification({
              message: messages.eventcreate.success,
              autoClose: true,
              type: "success",
              duration: 4
          });
				  //Session.set("selected", appointment);
				  //openUpdateAppointmentDialog();
				  Session.set("wizone", null);
				  Session.set("wizStepTwoActive", true);
				  
			  } else {
			    showNotification({
              message: messages.eventcreate.error,
              autoClose: true,
              type: "error",
              duration: 4
          });
			  }
		  });
		  Session.set("showCreateDialog", false);
		  } else {
			  showNotification({
            message: messages.eventcreate.validation,
            autoClose: true,
            type: "error",
            duration: 4
        });
		  }
      */

  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Two
Template.homewiztwo.events({
  
  'click #cancel' : function ( event, template ) {
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("two", "one");
  },
  
  'click #next' : function ( event, template ) {
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
        }
      });
    }
  }
});

Template.homewiztwo.timeproposals = function() {
  return Session.get("homewiztimeproposals");
}

Template.homewiztwo.rendered = function () {
  // Render datepicker
  $('#txtDate').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: true,
    autoclose: true
  });
  
  // Render timepicker
  $('#txtTime').timepicker({ 'scrollDefaultNow': true });
}


///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Three (Add Attendees)
Template.homewizthree.events({
  
  'click #cancel' : function ( event, template ) {
    transition("three", "two");
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("three", "two");
  },
  
  'click #next' : function ( event, template ) {
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
        }
      });
    }
  }
});

Template.homewizthree.attendees = function () {
    return Session.get("homewizattendees");
}

Template.homewizthree.rendered = function () {
  // Add HTML5 input patterns
  $('#txtName').attr("pattern", patterns.fullname);
  $('#txtEmail').attr("pattern", patterns.email);
}

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Four
Template.homewizfour.events({
  
  'click #cancel' : function ( event, template ) {

    transition("four", "three");
    transition("three", "two");
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("four", "three");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "four", "five" );
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Five
Template.homewizfive.events({
  
  'click #cancel' : function ( event, template ) {

    transition("five", "four");
    transition("four", "three");
    transition("three", "two");
    transition("two", "one");
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

    transition("six", "five");
    transition("five", "four");
    transition("four", "three");
    transition("three", "two");
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("six", "five");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "six", null );
  }
});

var transition = function ( fromStep, toStep ) {

  
  var fromstep = "#homewiz" + fromStep;
  var tostep = "#homewiz" + toStep;
  
  var fromsession = "wiz" + fromStep;
  var tosession = "wiz" + toStep;
  
  var frombutton = "#li" + fromStep;
  var tobutton = "#li" + toStep;
  
  
  Session.set(fromsession, null);
  Session.set(tosession, true);
  
  //$(fromstep).css({"display" : "none"});
  //$(tostep).css({"display" : "block"});
  
  $(fromstep).css({"height" : "0px"});
  $(fromstep).css({"opacity" : "0"});
  //$(fromstep).css({"display" : "none"});
  //sleep(1000);
  //$(tostep).css({"display" : "block"});
  $(tostep).css({"height" : "400px"});
  $(tostep).css({"opacity" : "1"});
  
  
  
  // Buttons
  $(tobutton).addClass("selected");
  $(tobutton + " .ca-icon").addClass("selected");
  $(tobutton + " .ca-main").addClass("selected");
  
  $(frombutton).removeClass("selected");
  $(frombutton + " .ca-icon").removeClass("selected");
  $(frombutton + " .ca-main").removeClass("selected");
  
  /*
  
  if (Session.get("wizone")) {
     //$(".ca-menu").css({"margin-bottom" : "260px"});
     $(".wizardPane").css({"height" : "0px"});
     $(".wizardPaneStep").css({"opacity" : "0"});
     $("#liStepOne").removeClass("selected");
     $("#liStepOne .ca-icon").removeClass("selected");
     $("#liStepOne .ca-main").removeClass("selected");
     Session.set("wizone", null);
     //$(".wizardPane").css({"display" : "none"});
   } else {
     //$(".ca-menu").css({"margin-bottom" : "800px"});
     Session.set("wizone", true);
     $(".wizardPane").css({"height" : "600px"});
     $(".wizardPaneStep").css({"opacity" : "1"});
     $("#liStepOne").addClass("selected");
     $("#liStepOne .ca-icon").addClass("selected");
     $("#liStepOne .ca-main").addClass("selected");
     //$(".wizardPane").css({"opacity" : "1"});
     //$(".wizardPane").css({"display" : "block"});
     Session.set("wizone", true);
   }
   
   */
}