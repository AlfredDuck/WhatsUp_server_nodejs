/*
*
* 处理手机号(America)
* 
*
*
*/

exports.americanPhoneNumber = function(phone_string){
   console.log(typeof phone_string);
   // 从字符串中提取数字（返回的还是字符串）
   var phone_num = phone_string.replace(/[^0-9]/ig,"");
   console.log(phone_num);
   return phone_num;
};
