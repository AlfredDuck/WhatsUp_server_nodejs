/*
message
*/

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var messagesSchema = new Schema({
   content: String,
   from: String,
   to: String,
   creat_time: Date,
});

module.exports = mongodb.mongoose.model("messages", messagesSchema);