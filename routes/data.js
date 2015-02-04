/*
data
 */
var addUsers = require('./../models/users.js');
var addMessages = require('./../models/messages.js');

//-----清理数据-----
exports.clear = function(req, res){
   
   addUsers.remove(function(err, num){
      console.log('REMOVE user:' + num);
      res.send('REMOVE user:' + num);
   });
   addMessages.remove(function(err, num){
      console.log('REMOVE messages:' + num);
      res.send('REMOVE messages:' + num);
   });
   addEmails.remove(function(err, num){
      console.log('REMOVE messages:' + num);
      res.send('REMOVE messages:' + num);
   });
}

//---注册用户---
exports.signup_user = function(req, res){
   addUsers.find(function(err,docs){
      if(err){
         console.log('[err]:' + err);
      }else {
         res.send(docs);
      }
   });
};

//---shadow---
exports.found_shadow = function(req, res){
   addShadows.find(function(err,docs){
      if(err){
         console.log('[err]:' + err);
      }else {
         res.send(docs);
      }
   });
};

//---message---
exports.message = function(req, res){
   addMessages.find(function(err,docs){
      if(err){
         console.log('[err]:' + err);
      }else {
         res.send(docs);
      }
   });
};


