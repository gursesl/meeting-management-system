///////////////////////////////////////////////////////////////////////////////
// User messages
var messages = {
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
var patterns = {
    "fullname" : "\\D{2,50}", 
    "email" : "\\S{1,50}@\\S{1,50}(\\.){1}\\S{2,3}"
}


///////////////////////////////////////////////////////////////////////////////
// Validation functions
var validateHomeWizOne = function ( title, location ) {
  //TODO: Add real validation
  return title && location;
}

var validateDateTime = function ( date, time ) {
  //TODO: Add real validation
  return date && time;
}

function validateNameAndEmail ( name, email ) {
  if (name && email) {
    if (name.match(patterns.fullname) && email.match(patterns.email))
      return true;
  } 
    
  return false;
}