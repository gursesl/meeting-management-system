// Session vars used in home page wizard
var wizvars = ['wiztitle', 'wizlocation', 'wizdecription', 'wizone', 'wiztwo', 'wizthree', 
            'wizfour', 'wizfive', 'wizsix'];

// Register Handlebar functions for template usage
wizvars.forEach (function (wiz) {
  Handlebars.registerHelper (wiz, function ( input ) {
    return Session.get(wiz);
  });
});
