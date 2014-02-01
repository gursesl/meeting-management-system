///////////////////////////////////////////////////////////////////////////////
//Utility functions: Analytics
///////////////////////////////////////////////////////////////////////////////

getAttendeesForAnEvent = function(appintmentId, isInvited) {
  return Attendees.find({"appointmentId" : appintmentId, "invited" : isInvited}).count();
}

getReadEmails = function(appintmentId, isRead) {
  return Attendees.find({"appointmentId" : appintmentId, "emailread" : isRead}).count();
}

getClicks = function(appintmentId, hasClicked) {
  return Attendees.find({"appointmentId" : appintmentId, "linkclicked" : hasClicked}).count();
}

getVotes = function(appintmentId, hasVoted) {
  return Attendees.find({"appointmentId" : appintmentId, "voted" : hasVoted}).count();
}