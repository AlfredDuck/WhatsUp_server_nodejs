//index.js

/*
 * 主路由
 *
 *
 */

// 数据
var addUsers = require('./../models/users.js');
var addMessages = require('./../models/messages.js');

// 模块
var apns = require('./apns.js');

exports.index = function(req, res){
   res.render('index', {
     content: '［接口调试］',
   });
};


/*
 * 注册
 *
 *
 */
exports.signup = function(req, res){
   console.log('【注册】');
   console.log(req.body);

   // 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {};

   addUsers.findOne({nickname:req.body.nickname},function(err, doc){
   	if (err){console.log('【error】' + err);}
      if (doc){
      	// 如果nickname已被使用
         json.status = 'unavailable';
         json.errcode = 160;
         console.log(json);
         res.send(json);
      } else {
      	// 如果nickname未被使用，则创建这个新用户
      	var newUser = new addUsers({
				nickname: req.body.nickname,
				password: req.body.password,
				friends: [],
				device: {
				   ios_token: req.body.device_token
				}
      	});
      	newUser.save(function(err, doc, num){
      		json.data = doc;
      		console.log(json);
      		res.send(json);
      	});
      }
   });
};




/*
 * 登录
 *
 *
 */
exports.login = function(req, res){
	console.log('【登录】');
	console.log(req.body);

	// 构建json返回值
	var json = {};
	json.status = 'available'; // 默认status是可用状态
	json.errcode = 110;
	json.data = {};

	addUsers.findOne({nickname: req.body.nickname}, function(err, doc){
		if (err) {console.log('【error】' + err);}
		if (doc) {
            if (req.body.password == doc.password) {
             	// 密码正确
                addUsers.update(
                    {nickname: req.body.nickname},  //查询项
                    {device: {ios_token: req.body.device_token}},  //修改项
                    {safe: true, multi: true},  //设置项
                    function(err, num){
                        if (err) {
                            console.log('[error]:' + err);
                        }
                        console.log('【update device token】: ' + num);
                        json.data = req.body;
                        console.log(json);
                        res.send(json);
                });
            } else {
            	// 密码错误
            	json.status = 'unavailable';
            	json.errcode = 130;
                console.log(json);
                res.send(json);
            }
		} else {
			// 该用户未注册
			json.status = 'unavailable';
			json.errcode = 120;
			console.log(json);
			res.send(json);
		}
	});
};




/*
 * 退出登录
 *
 *
 */
exports.logout = function(req, res){
   console.log('【退出登录】');
   console.log(req.body);
   
   // 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {};

   addUsers.update(
      {nickname: req.body.nickname},  //查询项
      {device: {ios_token: 'no device token'}},  //修改项
      {safe: true},  //设置项
      function(err, num){
         if (err) {console.log('【error】' + err);}
         if (num == 0) {
            console.log('ios token update: ' + num);
            json.status = 'unavailable';
            json.errcode = 210;
            console.log(json);
            res.send(json);
         } else if (num > 0){
            console.log('ios token update: ' + num);
            console.log(json);
            res.send(json);
         }
   });
};




/*
 * 更新token
 * 在检测到设备token有变化时
 *
 */
exports.update_token = function(req, res){
   console.log('【更新token】');
   console.log(req.body);

   // 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {
      token: req.body.device_token,
      nickname: req.body.nickname
   };

   addUsers.update(
      {nickname: req.body.nickname},  //查询项
      {device: {ios_token: req.body.device_token}},  //修改项
      {safe: true, multi: true},  //设置项
      function(err, num){
         if (err) {
            console.log('[error]:' + err);
         }
         console.log('【update】: ' + num);
         console.log(json);
         res.send(json);
   });
};




/*
 * 添加朋友关系
 * 只需一方添加，双方就互相是朋友关系了
 *
 */
exports.add_friend = function(req, res){
   console.log('【添加朋友关系】');
   console.log(req.body);
   if (req.body.nickname_guest == req.body.nickname_host) {
      return;  // 防止自己添加自己
   }

   // 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {};

   addUsers.findOne({nickname: req.body.nickname_guest}, function(err, doc){
   	if(err) {console.log('【error】' + err);}
   	if (doc) {
   		// 如果存在被添加方，添加双方到对方的朋友列表
   		add_friend_guest(req, res, doc, json);
   	} else {
   		// 如果不存在被添加方
   		json.status = 'unavailable';
   		json.errcode = 140;
   		console.log(json);
   		res.send(json);
   	}
   });
};

function add_friend_guest(req, res, doc_guest, json){
	// 更新被添加方的朋友列表
	var repeat = false;
	for (var i=0; i<doc_guest.friends.length; i++) {
		if (doc_guest.friends[i] == req.body.nickname_host) {
         repeat = true;
		}
	}
	if (!repeat) {
      doc_guest.friends.push(req.body.nickname_host);
      addUsers.update(
         {nickname: req.body.nickname_guest},  //查询项
         {friends: doc_guest.friends},  //修改项
         {safe: true, multi: true},  //设置项
         function(err, num){
            console.log('【update guest】: ' + num);
            add_friend_host(req, res, json);
      });
	} else {
      // 已经添加过
      json.status = 'unavailable';
      json.errcode = 170;
      console.log(json);
      res.send(json);
   }
}

function add_friend_host(req, res, json){
	// 更新主动添加方的朋友列表
	var repeat = false;
	addUsers.findOne({nickname: req.body.nickname_host}, function(err, doc_host){
		if (err) {console.log('【error】' + err);}
		if (doc_host) {
			for (var i=0; i<doc_host.friends.length; i++) {
				if (doc_host.friends[i] == req.body.nickname_guest) {
					repeat = true;
				};
			}
			if (!repeat) {
				doc_host.friends.push(req.body.nickname_guest);
				addUsers.update(
					{nickname: req.body.nickname_host},  //查询项
					{friends: doc_host.friends},  //修改项
					{safe: true, multi: true},  //设置项
					function(err, num){
						console.log('【update host】' + num);
						console.log(json);
						res.send(json);
				});
			} else {
            return;
         }
		}
	});
}


/*
 * 黑名单
 * 可以将某个朋友拉黑，双方解除朋友关系，并且无法被搜索到
 *
 */


/*
 * 拉取朋友列表
 *
 *
 */
exports.friends_list = function(req, res){
   console.log('【拉取朋友列表】');
   console.log(req.body);

   // 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {};

   addUsers.findOne({nickname: req.body.nickname}, function(err, doc){
   	if (err) {console.log('【error】' + err);}
   	if (doc) {
   		json.data = doc;
   		console.log(json);
   		res.send(json);
   	} else {
   		json.status = 'unavailable';
   		json.errcode = 150;
   		console.log(json);
   		res.send(json);
   	}
   });
};



/*
 * 发送消息
 *
 *
 */
exports.send_message = function(req, res){
	console.log('【发送消息】');
	console.log(req.body);

	// 构建json返回值
   var json = {};
   json.status = 'available'; // 默认status是可用状态
   json.errcode = 110;
   json.data = {};
   
   addUsers.findOne({nickname: req.body.to}, function(err, doc){
      if (err) {console.log('【error】' + err);}
      if (doc) {
         // 启动苹果推送
         console.log('[token]:' + doc.device.ios_token);
         if (doc.device.ios_token == 'no device token') {
            console.log('The user has no token');
            json.status = 'unavailable';
            json.errcode = 190;
            res.send(json);
         } else {
            if (doc.device.ios_token) {
               apns.apns(doc.device.ios_token, req.body.message, req.body.from);
            }
         }
         // 消息返回值
         json.data = req.body;
         res.send(json);
      } else {
         json.status = 'unavailable';
         json.errcode = 180;
         res.send(json);
      }
   });
};



