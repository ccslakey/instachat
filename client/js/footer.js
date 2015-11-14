// janky shim to put username in footer
Template.footer.helpers({
    username: function() {
        if (Meteor.user()) {
            var instagramUsername = Meteor.user() && Meteor.user().profile.instagram.username
            return instagramUsername
        } else {
            return Meteor.user() && Meteor.user().username;
        }
    }
});
