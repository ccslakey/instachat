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
    // can't get emails of undefined? come back to this
    // gravatar: function () {
    // 	if (Meteor.user().emails) {
    // 		var userEmail = Meteor.user().emails[0].address;
    // 		var url = Gravatar.imageUrl(userEmail);
    // 		return url
    // 	};
    // }
});
