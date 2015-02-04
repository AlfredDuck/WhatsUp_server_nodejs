/*
user是注册用户
*/
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var usersSchema = new Schema({
   nickname: String,
   password: String,
   friends: Array,
   device: {
      ios_token: String
   }
});

module.exports = mongodb.mongoose.model("users", usersSchema);