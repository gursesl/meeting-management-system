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
//Template: Home Page Wizard: Create an Event
Template.homewizcreateevent.events({
  'click #linkWizCreateEventCancel' : function ( event, template ) {
    console.log("Cancel create event button clicked");
    slideHomePageWizard(event, template);
  }
});