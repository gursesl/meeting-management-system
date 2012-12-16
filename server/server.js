// Doodle -- server

Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("appointments", function () {
  return Appointments.find(
    {$or: [{"public": true}, {invited: this.userId}, {owner: this.userId}]}, {sort: {createdDate: -1, title: 1}});
});