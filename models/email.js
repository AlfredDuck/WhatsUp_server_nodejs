/*
email address
*/

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var emailSchema = new Schema({
   cellphone: String,   //phone of unsigned user
   email: String
});

module.exports = mongodb.mongoose.model("email", emailSchema);