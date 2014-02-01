///////////////////////////////////////////////////////////////////////////////
//Template: Time proposals dialog
///////////////////////////////////////////////////////////////////////////////

Template.timeProposalsDialog.events({
  	'click #btnAddTimeProposals': function (event, template) {
   		var propDate = template.find("#proposalDate").value;
	  	var propTime = template.find("#proposalTime").value;
    	if (propDate.length && propTime.length) {
		  	Meteor.call("addTimeProposal", Session.get("selected"), {
		    	pdate: propDate,
			  	ptime: propTime
	  		}, function (error) {
		  		if (! error) {
        			$.pnotify({
          				title: 'Success',
          				text: messages.timeproposalcreate.success,
          				type: 'success'
        			});
		  		} else {
        			$.pnotify({
          				title: 'Error',
          				text: error.reason,
          				type: 'error'
        			});
		  		}
	  		});
    	} else {
      		$.pnotify({
        		title: 'Validation Error',
        		text: messages.timeproposalcreate.validation,
        		type: 'error'
      		});
	  	}
  	},

  	'click .done': function (event, template) {
    	Session.set("showTimeProposalsDialog", false);
    	// Hide modal
    	$('#timeProposalsModal').modal('hide');
    	// Hack to remove modal class from body
    	$('body').removeClass( "modal-open" );
    	return false;
  	}
});

Template.timeProposalsDialog.error = function() {
  return Session.get("createError");	
};

Template.timeProposalsDialog.rendered=function() {
  // TODO: Fix this shit
  /*
    $('#proposalDate').datepicker({
      format: 'mm/dd/yyyy',
      todayBtn: true,
      autoclose: true
    });
  */
  //$('#timeProposalsModal').modal('show');
}

///////////////////////////////////////////////////////////////////////////////
//Time proposals dialog
///////////////////////////////////////////////////////////////////////////////
openTimeProposalsDialog = function () {
  	Session.set("createError", null);
  	Session.set("showTimeProposalsDialog", true);
  	$('#timeProposalsModal').modal('show');
};