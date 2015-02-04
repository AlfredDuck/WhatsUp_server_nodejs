var cluster = require('cluster');
//check CPU numbers
var numCPUs = require('os').cpus().length;
//var start = require('./start.js');

var workers = {};
if (cluster.isMaster){
  cluster.on('exit', function(worker){
    //when a worker dead, restart it
    delete workers[worker.pid];
    worker = cluster.fork();
    workers[worker.pid] = worker;
  });
  //first start worker,as same as the CPU num
  //for (var i=0; i<numCPUs; i++){   控制使用的CPU数量，因为bae提供的CPU核数很多，占用太多内存
  for (var i=0; i<4; i++){
    var worker = cluster.fork();
    workers[worker.pid] = worker;
  }
  console.log('[master] is ok');
}
else if (cluster.isWorker){
  //start the app.js
  console.log('[worker] ' + cluster.worker.id + ' is ok');
  var app = require('./server');
  //http.createServer(app).listen(18080);
  app.listen(18080, function(){console.log('Server ' + cluster.worker.id + ' is ok');});
}
//when master is finished, close all process
process.on('SIGTERM', function(){
  for (var pid in workers){
    process.kill(pid);
  }
});


