
/*---发送邮件的例程---*/

var nodemailer = require("nodemailer");

//这里是初始化，需要定义发送的协议，还有你的服务邮箱，当然包括密码了
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "yitianchou@gmail.com",
        pass: "eric13864427782"
    }
});

var html = 
'<div id="email_head" style="background-color:#39c9b7;color:white;margin:0px;padding:0px">' + 
'<h1 style="padding-left:10px">SILENT</h1>'+
'<h4 style="padding-left:10px; padding-bottom:10px;">SEND Anonymous Message TO Your Friends</h4>'+
'</div>' +
'<div id="message">'+
'<p>You got a message from friend:</p>'+
'<p>balabalabala</p>'+
'</div>';

//发送邮件计时器
main();
function main(){   //使用setInterval做计时器以及循环,每隔10分钟调用一次，超过当前小时则停止
   sendMails();
   console.log('【开始发送邮件】');
   var timer = setInterval(function(){
      sendMails(html);
      console.log('【开始发送邮件】');
   }, 1000*5);
}

function sendMails(html){
//邮件配置，发送一下 unicode 符合的内容试试！
var mailOptions = {
    from:      "Dear, Joy",       // 发送地址
    to:        "cangbe@qq.com",   // 接收列表"cangbe@qq.com, zhaoyingzong@hahapinche.com"
    subject:   "hello, Joy",                             // 邮件主题
    text:      "This mail comes from \nmy mail robot",                          // 文本内容
    html:      html                    // html内容
}
//开始发送邮件
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("邮件已经发送: " + response.message);
    }
    //如果还需要实用其他的 smtp 协议，可将当前回话关闭
    //smtpTransport.close();
});
}
