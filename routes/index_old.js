/*
 * 
 * 
 */

// 数据
var addUsers = require('./../models/users.js');
var addMessages = require('./../models/messages.js');
var addEmails = require('./../models/email.js');

// 模块
var translatePhone = require('./phone_number.js');
var sendEmail = require('./send_email.js');
var apns = require('./apns.js');


exports.index = function(req, res){
   res.render('index', {
     content: '［接口调试］',
   });
};

exports.home = function(req, res){
   res.render('home');
};



/*
*
* 注册
* 
*
*
*/

exports.signup = function(req, res){
   var cellphone = req.body.cellphone;
   var password = req.body.password;
   var deviceToken = req.body.deviceToken;
   console.log('[SIGN UP] ' + cellphone + ' : ' + password);
   console.log(req.body);
   
   // 设置json返回值
   var callBackJson = {};
   
   addUsers.findOne({cellphone: cellphone}, function(err, doc){
      if(err){
         console.log('[err]:' + err);
      } 
      else if(doc){
         console.log('[this cellphone has been used]: ' + doc.cellphone);
         callBackJson.success = 'no';
         callBackJson.cellphone = cellphone;
         res.send(callBackJson);
      } else{
         console.log('[new user signup]');
         var newUser = new addUsers({
            cellphone: cellphone,       //
            nickname: null,                //unsure
            password: password,                    //
            isSignup: true,
            friends: [],
            device:{
               ios_token: deviceToken
            }
         });
         newUser.save(function(err, doc, num){
            console.log('[new number]:' + num);
            callBackJson.success = 'yes';
            callBackJson.cellphone = cellphone;
            res.send(callBackJson);
         });
      }
   });
};



/*
*
* 登录
* 
*
*
*/

exports.login = function(req, res){
   var cellphone = req.body.cellphone;
   var password = req.body.password;
      
   console.log('[LOG IN] ' + cellphone + ' : ' + password);
   console.log(req.body);
   
   callBackJson = {};
   
   addUsers.findOne({cellphone:cellphone, password:password, isSignup: true}, function(err, doc){
      if (err){
         console.log('[err]:' + err);
      } 
      else if (doc) {
         callBackJson.success = 'yes';
         callBackJson.cellphone = cellphone;
         console.log('[this user exist]: ' + cellphone + ':' + password);
         // check ios token
         if (
            (req.body.deviceToken != 'no device token')
            && (req.body.deviceToken != doc.device.ios_token)
         ) {
            // updata ios token
            console.log('更新iOS token');
            addUsers.update(
               {cellphone: cellphone},  //查询项
               {device: {ios_token: req.body.deviceToken}},  //修改项
               {safe: true, multi: true},  //设置项
               function(err, num){
                  console.log('ios token update: ' + num);
                  res.send(callBackJson);
            });
         }
         res.send(callBackJson);
      } else {
         callBackJson.success = 'no';
         callBackJson.cellphone = cellphone;
         console.log('SORRY YOU ARE NOT SIGNED');
         res.send(callBackJson);
      }
   });
};



/*
* 1.退出登录，清空记录的user token
* 2.前端更新了device token，同步到服务端
* 
*
*
*/
exports.logout = function(req, res){
   console.log('[Logout]');
   console.log(req.body);
   
   var callBackJson = {};
   addUsers.update(
      {cellphone: req.body.cellphone},  //查询项
      {device: {ios_token: 'no device token'}},  //修改项
      {safe: true},  //设置项
      function(err, num){
         console.log('ios token update: ' + num);
         callBackJson.logout = 'yes';
         res.send(callBackJson);
   });
};

exports.update_token = function(req, res){
   console.log(req.body);
   
   var callBackJson = {};
   addUsers.update(
      {cellphone: req.body.cellphone},  //查询项
      {device: {ios_token: req.body.token}},  //修改项
      {safe: true},  //设置项
      function(err, num){
         console.log('ios token update: ' + num);
         callBackJson.update_token = 'yes';
         res.send(callBackJson);
   });
};





/*
*
* 拉取message
* 
*
*
*/

exports.getMessage = function(req, res){
   var owner = req.body.owner;
   var skip = parseInt(req.body.skip);
   console.log('[Get Message]');
   console.log('skip:' + skip);
   
   // 返回的json数据封装
   var json = {};
   json.lie_to_apple = 'yes';
   
   // 查询条件
   var field = {
      $or : [
      
         {to: req.body.owner},
         {from: req.body.owner}
      ]
   };
   var option = {
      sort:[['_id', -1]],
      limit: 20,
      skip: skip
   };
   
   addMessages.find(field, null, option, function(err, docs){
      if(err){
         console.log('[err]: ' + err);
         json.name = owner;
         json.content = [{text: ':::err:::'}];
         res.send(json);
      }
      if(docs[0]){
         console.log('[callback message num]: ' + docs.length);
         json.name = owner;
         json.content = docs;
         res.send(json);
      } else {
         console.log('none message');
         json.name = 'none message';
         json.content = [];
         res.send(json);
      }
   });
};



/*
*
* 发送message
* 
*
*
*/

exports.sendMessage = function(req, res){
   console.log('[SEND MESSAGE]');
   console.log(req.body);
   
   var sendFrom     = req.body.from;
   var sendTo       = translatePhone.americanPhoneNumber(req.body.to);
   var sendText     = req.body.text;
   var sendTime     = new Date();
   var ms_id        = sendTime.getTime() + Math.floor(Math.random()*1000000).toString();
   
   var json = {};
   
   //储存message
   var newMessage = new addMessages({
      text: sendText,
      from: sendFrom,
      to: sendTo,
      creat_time: sendTime,
      message_id: ms_id
   });
   newMessage.save(function(err, doc, num){
      if (err){
         console.log('[err]:' + err);
         json.isSendSuccess = 'no';
         json.isToSignup = 'yes'; //假装存在，不用处理错误
         res.send(json);
      }
      if (doc){
         console.log('[store message successful]');
         // 检查收信人是不是注册用户
         isToSignup(req, res);
      }
   });
};

// 检查收信人是不是注册用户
function isToSignup(req, res){
   var to = translatePhone.americanPhoneNumber(req.body.to);
   var json = {};
   
   addUsers.findOne({cellphone: to}, function(err, doc){
      if (err){
         console.log('[err]:' + err);
      }
      if (doc){
         
         json.isToSignup = 'yes';
         json.isSendSuccess = 'yes';
         console.log('ms reciver exist');
         
         console.log('[token]:' + doc.device.ios_token);
         // 向APNs服务器发送通知(token, text)
         
         if (doc.device.ios_token == 'no device token') {
            console.log('he has no token');
         } else {
            apns.apns(doc.device.ios_token, req.body.text);
         }
         
         res.send(json);
         
      } else {
         // 检查是否有收信人的 email
         addEmails.findOne({cellphone: to}, function(err, doc){
            if (err) {
               console.log('[err]:' + err);
            }
            if (doc) {
               console.log('有收信人的邮箱');
               json.isToSignup = 'yes';
               json.isSendSuccess = 'yes';
               // 发送email:text, to
               var text = req.body.text;
               var to = doc.email;
               sendEmail.index(text, to);
               res.send(json);
            } else {
               console.log('没有收信人的邮箱');
               json.isToSignup = 'no';
               json.isSendSuccess = 'yes';
               res.send(json);
            }
         });
         
      }
   });
}






/*
*
* 保存unsigned user的email
* 
*
*
*/
exports.collectEmailAddress = function(req, res){
   console.log('[Email Address]');
   console.log(req.body);
   
   var email = req.body.email;
   var cellphone = translatePhone.americanPhoneNumber(req.body.cellphone);
   
   var newEmail = new addEmails({
      email: email,
      cellphone: cellphone
   });
   newEmail.save(function(err, doc, num){
      console.log('[Save Email Success]');
      // 发送email:text, to
      var text = req.body.text;
      var to = email;
      sendEmail.index(text, to);
      
      res.send(doc);
   });
};










//-----发送message-----
// exports.sendMessage = function(req, res){
//    console.log('SEND MESSAGE');
//    var sendFrom = req.body.from;
//    var sendTo = req.body.to;
//    var sendText = req.body.text;
//    var sendTime = new Date();
//    var id = sendTime.getTime() + Math.floor(Math.random()*1000000).toString();
//
//    //储存message
//    var newMessage = new addMessages({
//       text: sendText,
//       from: sendFrom,
//       to: sendTo,
//       creat_time: sendTime,
//       message_id: id
//    });
//    newMessage.save(function(err, doc, num){
//       console.log('[store message successful]');
//       //更新发送方message数组
//       addUsers.findOne({mail: sendFrom}, function(err, doc){
//          if(err){
//             console.log('err:' + err);
//          }else if(doc){
//             var messageJSON = {
//                message_id: id,
//                from_me: true
//             };
//             var messageArray = doc.messages;
//             messageArray.push(messageJSON);
//             addUsers.update(
//                {mail: sendFrom},  //查询项
//                {messages: messageArray},  //修改项
//                {safe: true,multi: true},  //设置项
//                function(err, num){
//                   console.log('from_me update: ' + num);
//                   res.send(messageArray);
//             });
//
//             //更新接收方message数组
//             updateToMe(sendTo, id, res);
//
//          }else{
//             console.log('can not find the sender');
//          }
//       });
//    });
// };
//
// function updateToMe(sendTo, id, res){
//    addUsers.findOne({mail: sendTo}, function(err, doc){
//       if(err){
//          console.log('err:' + err);
//       }else if(doc){
//          var messageJSON = {
//             message_id: id,
//             from_me: false
//          };
//          var messageArray = doc.messages;
//          messageArray.push(messageJSON);
//          addUsers.update(
//             {mail: sendTo},  //查询项
//             {messages: messageArray},  //修改项
//             {safe: true,multi: true},  //设置项
//             function(err, num){
//                console.log('to_me update: ' + num);
//                res.send(messageArray);
//          });
//       }else{
//          console.log('can not find the sender');
//       }
//    });
// }