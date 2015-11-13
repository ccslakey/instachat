Messages = new Mongo.Collection("messages");
Channels = new Mongo.Collection("channels");


if (Meteor.isClient) {
    Meteor.subscribe("messages");
    Meteor.subscribe("channels");

    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_EMAIL'
    });


    // decide to return insta or app username
    Template.registerHelper("usernameFromId", function(userId) {
        var user = Meteor.users.findOne({
            _id: userId
        });
        if (typeof user === "undefined") {
            return "Anonymous";
        }

        return user.username;
    });
    // get format timestamp
    Template.registerHelper("timestampToTime", function(timestamp) {
        var date = new Date(timestamp);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
    });

    Template.channel.helpers({
        active: function() {
            if (Session.get('channel') === this.name) {
                return "active";
            } else {
                return "";
            }
        }
    });


    Template.messages.helpers({
        messages: Messages.find({})
    });

    Template.messages.onCreated(function() {
        var self = this;
        self.autorun(function() {
            self.subscribe('messages', Session.get('channel'));
        });
    });


    Template.listings.helpers({
        channels: function() {
            return Channels.find();
        }
    });


    // listen for submit message event
    Template.footer.events({
        'keypress input': function(e) {
            var inputText = $('.input-box_text').val();
            if (inputText) {
                var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
                if (charCode == 13) {
                    e.stopPropagation();
                    var instaRes;

                    if (inputText.split(" ")[0] == "*ig:") {
                        var tagArr = inputText.split(" ");
                        hashTag = tagArr[1];
                        console.log("looking for #"+hashTag);

                        Meteor.call("callInstagram", hashTag, function(error, response) {
                            if (response) {
                                instaRes = JSON.parse(response.content);
                                console.log(instaRes);
                                instaHref = instaRes.data[0].link
                                console.log(instaHref);

                                Meteor.call('newMessage', {
                                    insta: instaHref,
                                    text: inputText,
                                    channel: Session.get('channel')
                                });
                                // stupid ajax workaround
                                $('.input-box_text').val("");
                                return false;

                            } else if (error) {
                                console.log("ERROR! Status: " + error.error + " because of " + error.reason)
                            };


                        });
                    };


                    Meteor.call('newMessage', {
                        text: inputText,
                        channel: Session.get('channel')
                    });
                    $('.input-box_text').val("");


                    return false;
                }
            }
        }
    });
}


if (Meteor.isServer) {
    // publications to client so we can hide our db from weird people
    Meteor.publish("messages", function(channel) {
        return Messages.find({
            channel: channel
        });
    });
    Meteor.publish('channels', function() {
        return Channels.find();
    });

    Channels.remove({});
    Channels.insert({
        name: "general"
    });
    Channels.insert({
        name: "random"
    });

    Meteor.startup(function() {
        // set up email to confirm account creation with user
        // thx mandrill
        smtp = {
            username: 'cromwellslakey@gmail.com',
            password: 'orange3cow',
            server: 'smtp.mandrillapp.com',
            port: 587
        };
        process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

    });

    // allow messages if user is properly logged in
    Messages.allow({
        insert: function(userId, doc) {
            return (userId && doc.user === userId);
        }
    });

    Meteor.methods({
        newMessage: function(message) {
            message.timestamp = Date.now();
            message.user = Meteor.userId();
            Messages.insert(message);
        },
        callInstagram: function(tag) {
            this.unblock();
            return Meteor.http.call("GET", "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + Meteor.settings.InstagramAPI.CLIENT_ID);
        }
    });
}
