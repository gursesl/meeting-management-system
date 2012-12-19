// Doodle -- server

Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("appointments", function () {
  return Appointments.find({}, {sort: {createdDate: -1, title: 1}});
});

Meteor.publish("timeproposals", function () {
	return TimeProposals.find({}, {sort : {"votes": 1}});
});

Meteor.publish("attendees", function () {
	return Attendees.find({owner: this.userId});
});