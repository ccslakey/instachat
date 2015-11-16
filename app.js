Messages = new Mongo.Collection("messages");
Channels = new Mongo.Collection("channels");


if (Meteor.isClient) {
    Meteor.subscribe("messages");
    Meteor.subscribe("channels");
    Meteor.subscribe("users");
    
    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_EMAIL'
    });

    // set online status for a user in the sidebar
    Template.userPill.labelClass = function() {
        if (this.status.idle) {
            return "label-warning"
        } else if (this.status.online) {
            return "label-success"
        } else {
            return "label-default"
        }
    };


    // decide to return insta or app username
    // get the username one way or another and display it in the footer
    Template.registerHelper("usernameFromId", function(userId) {
        var user = Meteor.users.findOne({
            _id: userId
        });
        if (typeof user === "undefined") {
            return "Anonymous";
        }

        return user.username;
    });
    //format timestamp to human readable format
    Template.registerHelper("timestampToTime", function(timestamp) {
        var date = new Date(timestamp);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);
    });

    // which channel is the user on and return a class for it
    Template.channel.helpers({
        active: function() {
            if (Session.get('channel') === this.name) {
                return "active";
            } else {
                return "";
            }
        }
    });

    // get messages
    Template.messages.helpers({
        messages: Messages.find({})
    });

    // subscribe template to messages on a particular channel
    Template.messages.onCreated(function() {
        var self = this;
        self.autorun(function() {
            self.subscribe('messages', Session.get('channel'));
        });
    });

    // get the channels
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
                    var instaURL;
                    // check if a user wants to make an instagram post
                    if (inputText.split(" ")[0] == "ig:") {
                        // get the words
                        var tagArr = inputText.split(" ");
                        // use the first one as a hashtag to post
                        hashTag = tagArr[1];
                        console.log("looking for #" + hashTag);
                        // call the server-side method to make http.get request on instagram's api
                        Meteor.call("callInstagramWithFuture", hashTag, function(error, response) {
                            if (response) {
                                instaRes = JSON.parse(response.content);
                                // console.log(instaRes);
                                instaURL = instaRes.data[0].images.standard_resolution.url;
                                // console.log(instaURL);
                                // insert a new message with instagram photo below it
                                Meteor.call('newMessage', {
                                    insta: instaURL,
                                    text: inputText,
                                    channel: Session.get('channel')
                                });
                                $('.input-box_text').val("");


                                return false;
                            } else if (error) {
                                // basic error handling
                                console.log("ERROR! " + error)
                            };


                        });

                    } else {
                        // don't use instagram in the message
                        Meteor.call('newMessage', {
                            text: inputText,
                            channel: Session.get('channel')
                        });
                        $('.input-box_text').val("");


                        return false;
                    }



                }
            }
        }
    });
}


if (Meteor.isServer) {
    // because async
    var Future = Npm.require('fibers/future');

    // publications to client so we can hide our db from weird people
    Meteor.publish("messages", function(channel) {
        return Messages.find({
            channel: channel
        });
    });
    Meteor.publish('channels', function() {
        return Channels.find();
    });
    // so we can give instagram username from server to the client
    Meteor.publish("users", function() {
        return Meteor.users.find({}, {
            fields: {
                profile: 1
            }
        })
    })
    // every group has the two basic channels
    Channels.remove({});
    Channels.insert({
        name: "general"
    });
    Channels.insert({
        name: "random"
    });

    // set some easy to get information
    // so we don't have to dig into the user.services object
    // we just want to add our own data to the object
    Accounts.onCreateUser(function(options, user) {
        if (options.profile) {
            user.profile = options.profile;
        }
        user.profile.instagram = {};
        user.profile.instagram.username = user.services.instagram.username;
        return user;
    });


    Meteor.startup(function() {
        // set up email to confirm account creation with user
        // this will display in the terminal console when you create an account
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
        // create a new message (in a channel)
        newMessage: function(message) {
            message.timestamp = Date.now();
            message.user = Meteor.userId();
            Messages.insert(message);
        },
        callInstagramWithFuture: function(tag) {
            //use npm future package in order to make newMessage WAIT until http response
            var future = new Future();
            Meteor.http.call("GET", "https://api.instagram.com/v1/tags/" + tag + "/media/recent?client_id=" + Meteor.settings.InstagramAPI.CLIENT_ID + "&count=1", {}, function(err, res) {
                if (err) {
                    future.return(error);
                } else {
                    future.return(res);
                }
            });
            return future.wait();
        }
    });
}
