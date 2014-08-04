Router.configure({
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
  layoutTemplate: 'layout'
});

Router.onBeforeAction('loading');

function requireAuthentication(pause) {
  if (Meteor.loggingIn()) {
    this.render('loading');
    pause();
  } else {
    if (!Meteor.user()) {
      if (this.path == "/sign-in")  {
        this.render('login');
      } else
        this.render('signUp');
      pause();
    }
  }
}

Router.onBeforeAction(requireAuthentication);

Router.map(function() {
  this.route('dashboard', {
    path: '/',
    fastRender: true,
    waitOn: function() {
      return [
        Meteor.subscribe("hosts"),Meteor.subscribe("appInstances")
      ];
    }
  });

  this.route('apps', {
    template: 'appInstances',
    fastRender: true,
    waitOn: function() {
      return [
        Meteor.subscribe("appInstances")
      ];
    }
  });

  this.route('appInstanceDetails', {
    path: 'app/:_id',
    fastRender: true,
    waitOn: function() {
      return [
        Meteor.subscribe("appInstance", this.params._id)
      ];
    },
    data: function () {
      return AppInstances.findOne(this.params._id);
    }
  });

  this.route("createAppInstance", {
    path: "create_app",
    waitOn: function() {
      return [
        Meteor.subscribe("dockerImages")
      ];
    }
  });

  this.route('images', {
    waitOn: function() {
      return [
        Meteor.subscribe("dockerImages")
      ];
    },
    data: function () {
      return DockerImages.find({}, {sort: {name: 1}});
    }
  });

  this.route('hosts', {
    fastRender: true,
    waitOn: function() {
      return [
        Meteor.subscribe("hosts")
      ];
    },
    data: function () {
      return Hosts.find({}, {sort: {'details.Containers': -1}});
    },
    onAfterAction: function () {
      Meteor.call("host/refreshDetails");
    }
  });

  this.route("settings", {
    waitOn: function() {
      return [ Meteor.subscribe("settings")];
    }
  });

});

// Active pages
if (Meteor.isClient) {
  UI.registerHelper("currentPageIs", function (name) {
    var current = Router.current();
    return current && current.route.name === name;
  });
}