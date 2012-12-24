(function () {

console.log("Starting Meteor server...");
	
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

//TimeProposals._ensureIndex({"_id" : 1, "rsvps.email" : 1}, {"unique" : true, "dropDups" : true});

Meteor.startup(function () {
  process.env.MAIL_URL = 'smtp://info%4064clicks.com:passw0rd@smtp.gmail.com:465';
});

console.log("Started Meteor server!");

}) ();

