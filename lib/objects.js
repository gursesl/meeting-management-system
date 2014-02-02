//Class TimePropsal
function TimeProposal (date, time) {
  this.date = date;
  this.time = time;
  this.id = Meteor.uuid();
}

//Class Attendee
function Attendee (name, email) {
  this.name = name;
  this.email = email;
  this.id = Meteor.uuid();
}

getInviteUrl = function (eventId, email) {
  return Meteor.absoluteUrl("invite/" + eventId + "/" + email);
}

getEventUrl = function (eventId, email) {
  return Meteor.absoluteUrl("event/" + eventId + "/" + email);
}

getPixelTrackingUrl = function (eventId, email) {
  return Meteor.absoluteUrl("tracking/" + eventId + "/" + email);
}