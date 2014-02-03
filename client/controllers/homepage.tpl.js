///////////////////////////////////////////////////////////////////////////////
//Template: Homepage
///////////////////////////////////////////////////////////////////////////////

Template.homepage.events({
    'keyup #event_search_box' : function (evt) {
    	Session.set("eventname", evt.currentTarget.value);
	}
});

Template.homepage.isuser = function() {
  return Meteor.user() && !Session.get("wizardInProgress");
}

Template.homepage.showUpdateAppointmentDialog = function () {
  return Session.get("showUpdateAppointmentDialog");
};

Template.homepage.showTimeProposalsDialog = function () {
  return Session.get("showTimeProposalsDialog");
};

Template.homepage.showAttendeesDialog = function () {
  return Session.get("showAttendeesDialog");
};