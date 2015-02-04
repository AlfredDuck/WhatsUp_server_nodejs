exports.net = function(req, res){
   console.log('the ios http get!');
   var arr = new Array();
   arr.push('hello');
   arr.push('world');
   res.send(arr);
};