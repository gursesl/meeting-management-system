"use strict";
    
///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Login
Template.homewizlogin.events({
  'click #login-buttons-password' : function( event, template ) {
    console.log("Wizard login button clicked");
    
    var email = template.find("#login-email").value;
    var password = template.find("#login-password").value;
    
    Meteor.loginWithPassword(email, password, function (error) {
      if (! error) {
        console.log("Login successful!");
      } else {
        console.log("Login failed!");
      }
    })
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step One
Template.homewizone.events({
  
  'click #cancel' : function ( event, template ) {
    console.log("Cancel create event button clicked");
    slideHomePageWizard(event, template);
  },
  
  'click #next' : function ( event, template ) {
    console.log("Next button clicked");
    // Read form variables
    var title = template.find("#txtTitle").value;
    var location = template.find("#txtLocation").value;
    var desc = template.find("#txtDescription").value;
     
    // Set session variables
    Session.set("wiztitle", title);
    Session.set("wizlocation", location);
    Session.set("wizdecription", desc);
    
    // Transition wizard panes
    transition("one", "two");
    
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
    console.log("Cancel create event button clicked");
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("two", "one");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "two", "three" );
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Three
Template.homewizthree.events({
  
  'click #cancel' : function ( event, template ) {
    console.log("Cancel button clicked");
    transition("three", "two");
    transition("two", "one");
    slideHomePageWizard(event, template);
  },
  
  'click #prev' : function ( event, template ) {
    transition("three", "two");
  },
  
  'click #next' : function ( event, template ) {
    transition ( "three", "four" );
  }
});

///////////////////////////////////////////////////////////////////////////////
//Template: Home Page Wizard: Step Four
Template.homewizfour.events({
  
  'click #cancel' : function ( event, template ) {
    console.log("Cancel button clicked");
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
    console.log("Cancel button clicked");
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
    console.log("Cancel button clicked");
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