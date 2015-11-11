Messages = new Mongo.Collection("messages");

// sanity check the db
Messages.insert({greeting: "hello"}, function() {});