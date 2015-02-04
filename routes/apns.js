/*
 * 苹果推送
 */
var apns = require('apn');
var addLimitedToken = require('./../models/limited_token.js');

var options = {
    /*本来下面是可以写同路径的，但是因为当前模块是被引用的，所以要写引用者的路径*/
    //cert: 'cert.pem',
    //key:  'key.pem',
    cert: './routes/cert.pem',                             /* Certificate file path */
    key:  './routes/key.pem',                              /* Key file path */
    gateway: 'gateway.push.apple.com',    /* gateway address */
    port: 2195,                                   /* gateway port */
    errorCallback: errorHappened ,                /* Callback when error occurs function(err,notification) */
}; 

function errorHappened(err, notification){
    console.log("err " + err);
}

var apnsConnection = new apns.Connection(options);

function startSend(deviceToken, text){
   var token = deviceToken;
   var myDevice = new apns.Device(token);
   var note = new apns.Notification();
   note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
   note.badge = 1;  // 程序图标的小红点数量
   note.sound = "sleep.m4a";
   note.alert = text;
   note.payload = {'messageFrom': 'Silent'};
   note.device = myDevice;

   apnsConnection.sendNotification(note);
}


exports.apns = function(token, message){
   console.log('[send to apns]');
   //var deviceToken = "3a4925d81ec6ab9065a9e5c26f9b75257d6a4f3e24bb00b42c3be6d766840373";
   // 对message长度做限制，控制在134个字符以内
   var messageForAPNs;
   if (message.length <= 130) {
      messageForAPNs = message;
   } else {
      messageForAPNs = message.substr(0, 130) + '...';
   }
   startSend(token, messageForAPNs);
};

//main();
function main(){
   var i = 0;
   var timer = setInterval(function(){
      console.log('【开始send】:' + i);
      i++;
      var deviceToken = "3a4925d81ec6ab9065a9e5c26f9b75257d6a4f3e24bb00b42c3be6d766840373";
      startSend(deviceToken, 'Hello Silent ' + i);
      //clearInterval(timer);
   }, 2000);
}



/*
*
* APNs 已卸载客户端token或已实效token的列表，暂时不知道怎么用
*
*
*/
// Setup a connection to the feedback service using a custom interval (10 seconds)
var feedback = new apns.feedback({ address:'feedback.sandbox.push.apple.com', interval: 10 });

feedback.on('feedback', handleFeedback);
feedback.on('feedbackError', console.error);

function handleFeedback(feedbackData) {
	var time, device;
	for(var i in feedbackData) {
		time = feedbackData[i].time;
		device = feedbackData[i].device;

		console.log("Device: " + device.toString('hex') + " has been unreachable, since: " + time);
      
      newToken = new addLimitedToken({
         time: time,
         device: device
      });
      newToken.save(function(err, doc, num){
         if (err) {
            console.log('err' + err);
         }
      });
	}
}
