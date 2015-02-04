/*
*
* 通过some.silent.friend@gmail.com发送邮件
* 
*
*
*/

var nodemailer = require("nodemailer");
//这里是初始化，需要定义发送的协议，还有你的服务邮箱，当然包括密码了
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "some.silent.friend@gmail.com",
        pass: "eric13864427782"
    }
});

exports.index = function(text, to){
   console.log('[Text]: ' + text);
   console.log('[To]: ' + to);
   var _text = text + '\n -message from some friend on SILENT(http://www.silent.com)';
   var html = '<div id="email_head" style="background-color:#39c9b7;color:white;margin:0px;padding:0px">' + 
               '<h1 style="padding-left:10px"><a href="http://www.silent.com" style="text-decoration:none; color:white">SILENT</a></h1>'+
               '<h4 style="padding-left:10px; padding-bottom:10px;"><a href="http://www.silent.com" style="text-decoration:none; color:white">SEND Anonymous Message TO Your Friends</a></h4>'+
               '</div>' +
               '<div id="message">'+
               '<p>You got a message from friend:</p>'+
               '<p>' + text + '</p>'+
               '</div>';
               
   smtpTransport.sendMail({
       from: "SILENT",        // 发送地址
       to: to,                   // 接收列表
       subject: "SILENT",                             // 邮件主题
       text: _text,                          // 文本内容
       html: html                    // html内容
   }, function(err, info){
       if(err){
           console.log('err: ' + err);
       }else{
           console.log("邮件已经发送: " + info.response);
       }
 	    //如果还需要实用其他的 smtp 协议，可将当前回话关闭
 	    smtpTransport.close();
   });
               
   //sendMails(to, _text, html);
};

function sendMails(to, text, html){
	//邮件配置，发送一下 unicode 符合的内容试试！
	var mailOptions = {
	    from: "SILENT",        // 发送地址
	    to: to,                   // 接收列表
	    subject: "SILENT",                             // 邮件主题
	    text: text,                          // 文本内容
	    html: html                    // html内容
	}
	//开始发送邮件
	smtpTransport.sendMail(mailOptions, function(err, info){
	    if(err){
	        console.log('err: ' + err);
	    }else{
	        console.log("SendMailSuccess: " + info.response);
	    }
	    //如果还需要实用其他的 smtp 协议，可将当前回话关闭
	    //smtpTransport.close();
	});
}


////////////
/*
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sender@gmail.com',
        pass: 'password'
    }
});
transporter.sendMail({
    from: 'sender@address',
    to: 'receiver@address',
    subject: 'hello',
    text: 'hello world!'
});
*/