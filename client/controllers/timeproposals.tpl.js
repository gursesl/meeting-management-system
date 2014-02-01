///////////////////////////////////////////////////////////////////////////////
//Time proposals dialog 
openTimeProposalsDialog = function () {
  Session.set("createError", null);
  Session.set("showTimeProposalsDialog", true);
  $('#timeProposalsModal').modal();
};