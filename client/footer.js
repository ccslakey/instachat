// janky shim to put username in footer
Template.footer.helpers({
  username: function () {
    return Meteor.user() && Meteor.user().username;
  }
});