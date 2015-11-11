Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
    Meteor.subscribe("messages");


    Template.messages.helpers({
        messages: Messages.find({})
    });


    // listen for submit message
    Template.footer.events({
      'keypress input': function(e) {
        var inputVal = $('.input-box_text').val();
        if(!!inputVal) {
          var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
          if (charCode == 13) {
            e.stopPropagation();
            Messages.insert({text: $('.input-box_text').val()});
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
    
        // sanity check your db and you will be pleased as punch
        //     for (var i = 0; i < 10; i++) {
        //         Messages.insert({
        //             text: "A dummy message"
        //         });
        // }
    });
}
