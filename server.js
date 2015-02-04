
/**
 * Module dependencies.
 */

var express = require('express');
/*-----分离路由，方便管理和阅读-------------*/
var routes = require('./routes/index.js');
var ios_net = require('./routes/ios_net.js');
var data = require('./routes/data.js');

/*其他核心模块*/
var http = require('http');
var path = require('path');
var ejs = require('ejs');

/*-------------提供会话支持（1）---------------*/
/*
var SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
  //url:"mongodb://<user>:<password>@emma.mongohq.com:10051/alfredmongodb/session",
  //本地数据库
  url: "mongodb://localhost/session",
  interval: 120000
});
*/

var app = express();

// all environments
app.set('port', process.env.PORT || 18080);
app.set('views', __dirname + '/views');
app.engine('.html',ejs.__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.bodyParser({uploadDir:'./temporary_store'}));
app.use(express.methodOverride());
/*------------用于提供会话支持（2）----------------*/
/*
app.use(express.cookieParser());
app.use(express.cookieSession({secret : 'fens.me'}));
app.use(express.session({
  secret : 'fens.me',
  store: store,
  cookie: { maxAge: 900000 }
}));
*/

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//事件处理程序调度(路由器)
//app.get('/', routes.home);
app.get('/index', routes.index);
app.post('/signup', routes.signup);
app.post('/login', routes.login);
app.post('/add_friend', routes.add_friend);
app.post('/friends_list', routes.friends_list);
app.post('/send_message', routes.send_message);
app.post('/update_token', routes.update_token);
/*
app.post('/logout', routes.logout);
app.post('/send_message', routes.sendMessage);
app.post('/get_message', routes.getMessage);
app.post('/send_email', routes.collectEmailAddress);
*/
//数据查询（通过网页）
//app.get('/data_clear', data.clear);
app.get('/data_signup', data.signup_user);
app.get('/data_message', data.message);


//端口监听
if (!module.parent){
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}
module.exports = app;
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
