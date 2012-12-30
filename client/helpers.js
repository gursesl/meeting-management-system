// Session vars used in home page wizard
wizvars = ['wiztitle', 'wizlocation', 'wizdecription'];

// Register Handlebar functions for template usage
wizvars.forEach (function (wiz) {
  Handlebars.registerHelper (wiz, function ( input ) {
    return Session.get(wiz);
  });
});
