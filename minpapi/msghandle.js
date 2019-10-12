const formatMsg = require('./fmtwxmsg');

function help(){
    //字符串形式返回帮助信息
    //还可以是以读取文件的形式来返回。
    return '你好，这是一个测试号，目前会原样返回用户输入的数据对象'
}
/**
 * @param {object} wxmsg 解析XML消息对象
 * @param {object} retmsg 要返回的数据对象
 */

 function userMsg(wxmsg,retmsg){
     //关键字自动回复
     if(wxmsg.MsgType == 'text'){
         switch(wxmsg.Content){
            case '帮助' :
            case 'help':
            case '?':
                retmsg.msg = help();
                retmsg.msgtype = 'text';
                return formatMsg(retmsg);
            case 'who':
                retmsg.msgtype='text';
                retmsg.msg = '姓名:曹倩,学号：2017011960,班级:6班';
                return formatMsg(retmsg);
            case 'about':
                retmsg.msgtype='text';
                retmsg.msg = '我是这个测试号开发者，如有问题请联系我';
                return formatMsg(retmsg);
            default:
                retmsg.msgtype = 'text';
                retmsg.msg = wxmsg.Content;
                return formatMsg(retmsg);
         }
     }
     //处理其他类型消息
        switch(wxmsg.MsgType){
            case 'image' :
                
            case 'voice':
                retmsg.msgtype=wxmsg.MsgType;
                retmsg.msg = wxmsg.MediaId;
                return formatMsg(retmsg);
            default:
                //retmsg.msgtype类型为空
                //格式化数据会返回default 处的数据
                //提示用户该用户类型不被支持
                return formatMsg(retmsg);
        }
     
 }

exports.help = help;
exports.userMsg = userMsg;

//后续还会加入时间消息支持
exports.msgDispatch = function(wxmsg,retmsg){
    return userMsg(wxmsg,retmsg);
}

