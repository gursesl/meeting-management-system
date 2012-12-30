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
  },
  
  'click #linkWizCreateEventNext' : function ( event, template ) {

    // Read form variables
    var title = template.find("#txtTitle").value;
    var location = template.find("#txtLocation").value;
    var desc = template.find("#txtDescription").value;
     
    // Set session variables
    Session.set("wiztitle", title);
    Session.set("wizlocation", location);
    Session.set("wizdecription", desc);
         
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
				  Session.set("selected", appointment);
				  //openUpdateAppointmentDialog();
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


  }
});

Template.homewizcreateevent.rendered = function () {

}