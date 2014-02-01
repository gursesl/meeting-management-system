///////////////////////////////////////////////////////////////////////////////
//Template: Dashboard
///////////////////////////////////////////////////////////////////////////////

Template.dashboard.anyAppointments = function() {
  if (Meteor.user()) {
    return Appointments.find({"owner": Meteor.userId()}).count() > 0;
  } else {
	  return null;
  }
};
	
Template.dashboard.appointments = function () {
  if (Session.get("eventname") != null && Session.get("eventname") != "") {
    var regex = new RegExp(Session.get("eventname"), "i");
    return Appointments.find({"owner": Meteor.user()._id, $or: [{"title": regex}, {"description": regex}, {"location": regex}]}, {sort: {createdDate: -1}});
  } else {
    return Appointments.find({"owner": Meteor.user()._id}, {sort: {createdDate: -1}});
  }
};

Template.dashboard.eventname = function() {
  return Session.get("eventname");
};