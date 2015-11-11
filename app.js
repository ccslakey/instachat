Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
    Meteor.subscribe("messages");

    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_EMAIL'
    });




    // decide to return insta or app username
    Template.registerHelper("usernameFromId", function (userId) {
        var user = Meteor.users.findOne({_id: userId});
        if (typeof user === "undefined") {
            return "Anonymous";
        }

        return user.username;
    });

    // get format timestamp
    Template.registerHelper("timestampToTime", function (timestamp) {
        var date = new Date(timestamp);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
    });


    Template.messages.helpers({
        messages: Messages.find({})
    });


    // listen for submit message event
    Template.footer.events({
      'keypress input': function(e) {
        var inputVal = $('.input-box_text').val();
        if(!!inputVal) {
          var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
          if (charCode == 13) {
            e.stopPropagation();
            
            Messages.insert({
            text: $('.input-box_text').val(),
            user: Meteor.userId(),
            timestamp: Date.now()
            });

            $('.input-box_text').val("");
            return false;
          }    
        }
      }
    });

}


if (Meteor.isServer) {
    Meteor.publish("messages", function() {
        return Messages.find();
    })


    
    Meteor.startup(function() {
    
        // set up email to confirm account creation with user
        // thx mandrill
        smtp = {
            username: 'cromwellslakey@gmail.com',
            password: 'orange3cow',
            server:   'smtp.mandrillapp.com',
            port: 587
         };
            
        process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;



        // sanity check your db and you will be pleased as punch
        //     for (var i = 0; i < 10; i++) {
        //         Messages.insert({
        //             text: "A dummy message"
        //         });
        // }
    });
}
