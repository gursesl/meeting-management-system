// Class TimePropsal
// TODO: Refactor this shit to remove code duplication
function TimeProposal (date, time) {
  this.date = date;
  this.time = time;
  this.id = Meteor.uuid();
}

//Class Attendee
// TODO: Refactor this shit to remove code duplication
function Attendee (name, email) {
  this.name = name;
  this.email = email;
  this.id = Meteor.uuid();
}

slideHomePageWizard = function (event, template, step) {
  
  var stepFound = false;
  _.each(["zero", "one", "two", "three", "four", "five", "six"], function (element) {
        
    if (element == step)
      stepFound = true;
  });
  
  //If step not found, set to "zero"
  if (!stepFound) {
    step = "zero";
  }
  
  
  if (Session.get("wizzero") || Session.get("wizone") || Session.get("wiztwo") || Session.get("wizthree") || Session.get("wizfour") || Session.get("wizfive") || Session.get("wizsix")) {
    resetWizard( Session.get("keepview") );
   
    // Animate panes
    if ( !Session.get("keepview") ) {
      $(".wizardPane").css({"height" : "0px"});
      $(".wizardPane").css({"padding-top" : "0px"});
      $(".wizardPaneStep").css({"opacity" : "0"});
    } else {
      $(".wizardPane").css({"height" : "600px"});
      $(".wizardPane").css({"padding-top" : "80px"});
      $(".wizardPaneStep").css({"opacity" : "1"});
      $("html, body").animate({ scrollTop: 0 }, "slow");
      
    }
        
    // Deselect button
    $("#li" + step).removeClass("selected");
    $("#li" + step + " .ca-icon").removeClass("selected");
    $("#li" + step + " .ca-main").removeClass("selected");
    
  } else {
    $(".wizardPane").css({"height" : "600px"});
    $(".wizardPane").css({"padding-top" : "80px"});
    $(".wizardPaneStep").css({"opacity" : "1"});
    $("html, body").animate({ scrollTop: 0 }, "slow");

    // Animate panes
    transition(null, step);
    
    // Keep button selected
    $("#li" + step).addClass("selected");
    $("#li" + step + " .ca-icon").addClass("selected");
    $("#li" + step + " .ca-main").addClass("selected");
  }
}

resetWizard = function (step) {
  //console.log ("reset wizard");
  _.each(["one", "two", "three", "four", "five", "six"], function (element) {
    //console.log ("_.each: " + element);
    // Reset session vars
    Session.set("wiz" + element, null);
    
    // Reset div heights
    transition( element, null );
  });
  
  if ( step != null ) {
    //console.log("found keepview: " + step);
    transition (null, step);
  }
}


// Transition between two steps in homepage wizard
transition = function (fromStep, toStep) {
  
  if (!Session.get("wizardinprogress")) {
    fromStep = null;
    toStep = "one";
  }

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

  $(tostep).css({"height" : "450px"});
  $(tostep).css({"opacity" : "1"});
  
  // Buttons
  $(tobutton).addClass("selected");
  $(tobutton + " .ca-icon").addClass("selected");
  $(tobutton + " .ca-main").addClass("selected");
  
  $(frombutton).removeClass("selected");
  $(frombutton + " .ca-icon").removeClass("selected");
  $(frombutton + " .ca-main").removeClass("selected");
}

    
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
  
  'click #next' : function (event, template) {
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
      Session.set("wizardinprogress", true);
      
      // Transition
      transition("one", "two");
    } else {
      $.pnotify({
        title: 'Validation Error',
        text: messages.eventcreate.validation,
        type: 'error'
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

      $.pnotify({
        title: 'Success',
        text: messages.timeproposalcreate.success,
        type: 'success'
      });

    } else {
      $.pnotify({
        title: 'Validation Error',
        text: messages.timeproposalcreate.validation,
        type: 'error'
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
  // TODO: Fix this shit
  /*
  $('#txtDate').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: true,
    autoclose: true
  }); */
  
  // Render timepicker

  $('#txtTime').timepicker({ 'scrollDefaultNow': true });
  
  // Add HTML5 input patterns
  $('#txtDate').attr("pattern", patterns.date);
  $('#txtTime').attr("pattern", patterns.time);
  Session.set("keepview", "two");
  transition("one", "two");
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

      $.pnotify({
        title: 'Success',
        text: messages.attendeecreate.success,
        type: 'success'
      });

    } else {
      $.pnotify({
        title: 'Validation Error',
        text: messages.attendeecreate.validation,
        type: 'error'
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
  Session.set("keepview", "three");
  transition("two", "three");
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
  //TODO: FIX THIS!!!
  //return generateShortHash();
}

Template.homewizfour.rendered = function () {
  Session.set("keepview", "four");
  transition("three", "four");
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

Template.homewizfive.rendered = function () {
  Session.set("keepview", "five");
  transition("four", "five");
}


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

Template.homewizsix.rendered = function () {
  Session.set("keepview", "six");
  transition("five", "six");
}