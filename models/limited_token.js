/*
苹果返回的失效的token列表
*/

var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var limitedTokenSchema = new Schema({
   time: String,
   device: String
});

module.exports = mongodb.mongoose.model("limitedToken", limitedTokenSchema);