//Class TimePropsal
function TimeProposal ( date, time ) {
  this.date = date;
  this.time = time;
  this.id = Meteor.uuid();
}

//Class Attendee
function Attendee ( name, email ) {
  this.name = name;
  this.email = email;
  this.id = Meteor.uuid();
}

var getInviteUrl = function ( eventId, email ) {
  return Meteor.absoluteUrl("invite/" + eventId + "/" + email);
}

var getEventUrl = function ( eventId, email ) {
  return Meteor.absoluteUrl("event/" + eventId + "/" + email);
}

var getPixelTrackingUrl = function ( eventId, email ) {
  return Meteor.absoluteUrl("tracking/" + eventId + "/" + email);
}