///////////////////////////////////////////////////////////////////////////////
// User validation messages
messages = {
  "eventcreate" : {"success" : "Event created successfully.", "error" : "There was an error creating the event.", "validation" : "Event name and location are required to create an event."},
  "eventsave" : {"success" : "Event saved successfully.", "error" : "There was an error saving the event."},
  "eventdelete" : {"success" : "Event deleted successfully.", "error" : "There was an error deleting the event."},
  "inviteone" : {"success" : "Invite sent successfully.", "error" : "There was an error sending the invite."},
  "inviteall" : {"success" : "Invite sent successfully to all attendees.", "error" : "There was an error sending the invite."},
  "timeproposalcreate" : {"success" : "Time proposal created successfully.", "error" : "There was an error creating the time proposal.", "validation" : "Date and time are required to create a time proposal."},
  "timeproposalsave" : {"success" : "Time proposal saved successfully.", "error" : "There was an error saving the time proposal."},
  "timeproposaldelete" : {"success" : "Time proposal deleted successfully.", "error" : "There was an error deleting the time proposal."},
  "attendeecreate" : {"success" : "Attendee added successfully.", "error" : "There was an error adding the attendee.", "validation" : "Name and a valid email address are required to add an attendee."},
  "attendeesave" : {"success" : "Attendee saved successfully.", "error" : "There was an error saving the attendee."},
  "attendeedelete" : {"success" : "Attendee deleted successfully.", "error" : "There was an error deleting the attendee."},
  "voting" : {"success" : "Thank you for casting your vote. You can vote on multiple events and you can change your vote at any time by voting again.", "error" : "There was an error casting your vote. Please try again later."}
}

///////////////////////////////////////////////////////////////////////////////
// Validation patterns
patterns = {
    "fullname"  : "^.{2,50}$",
    "email"     : "\\S{1,50}@\\S{1,50}(\\.){1}\\S{2,3}",
    "title"     : "^.{2,100}$",
    "location"  : "^.{2,100}$",
    "date"      : "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\\d\\d",
    "time"      : "^ *(1[0-2]|[1-9]):[0-5][0-9] *(a|p|A|P)(m|M) *$"
}


///////////////////////////////////////////////////////////////////////////////
// Validation functions
validateHomeWizOne = function (title, location) {
  if (title && location) {
    if (title.match(patterns.title) && location.match(patterns.location))
      return true;
  }
}

validateDateTime = function (date, time) {
  if (date && time) {
    if (date.match(patterns.date) && time.match(patterns.time))
      return true;
  }
}

validateNameAndEmail = function (name, email) {
  if (name && email) {
    if (name.match(patterns.fullname) && email.match(patterns.email))
      return true;
  } 
    
  return false;
}