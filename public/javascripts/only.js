$(document).ready(function(){
/*
$('input').bind('focus', function(){
   $(this).val('');
});
*/
var title = $('#city').attr('title');
var condition = 'a[title=' + title + ']';
$(condition).attr('class', 'in').siblings().attr('class', 'out');

});

