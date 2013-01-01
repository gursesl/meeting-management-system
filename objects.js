function TimeProposal(date, time) {
  this.date = date;
  this.time = time;
  this.id = Meteor.uuid();
}