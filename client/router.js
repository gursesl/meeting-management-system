var EventRouter = Backbone.Router.extend({
  routes: {
	  "/events/:event_id" : "main",
	  "/features" : "features"
  },
  
  features: function() {
	  this.navigate("/features/123");
  },
  
  main: function(event_id) {
	Session.set("selected", event_id);
  },
  
  setEvent: function(event_id) {
    this.navigate("/events/" + event_id, true);
  }
});

Router = new EventRouter();

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});