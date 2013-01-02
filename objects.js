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

