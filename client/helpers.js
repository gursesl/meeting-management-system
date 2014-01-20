// Session vars used in home page wizard
wizvars = ['wiztitle', 'wizlocation', 'wizdecription', 'wizzero', 'wizone', 'wiztwo', 'wizthree', 
            'wizfour', 'wizfive', 'wizsix', 'homewiztimeproposals', 'homewizattendees'];

// Register Handlebar functions for template usage
wizvars.forEach (function (wiz) {
  Handlebars.registerHelper (wiz, function ( input ) {
    return Session.get(wiz);
  });
});

//TODO: This function should be refactored into a more reliable, truly randomized hash
generateShortHash = function () {
  return Meteor.uuid().split("-")[0];
}

///////////////////////////////////////////////////////////////////////////////
//Utility functions
okcancel_events = function (selector) {
  return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
}
	
make_okcancelhandler = function (options) {
	var ok = options.ok || function () {};
	var cancel = options.cancel || function () {};
	
	return function (evt) {
		if (evt.type === "keydown" && evt.which === 27) {
			// escape = cancel
			cancel.call(this.evt);
		} else if (evt.type === "keyup" && evt.which === 13) {
			var value = String(evt.target.value || "");
			if (value)
				ok.call(this, value, evt);
			else
				cancel.call(this, evt);
		}
	}
}