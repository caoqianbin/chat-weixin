const gohttp = require('gohttp');
const wxkey = require('./gzhkey');

var token_api = `https://api.weixin.qq.com/cgi-bin/token`
    + `?grant_type=client_credential`
    + `&appid=${wxkey.appid}&secret=${wxkey.secret}`;

var menu_data = {
    button:[
           {
                name:'Linux',
                sub_button:[{
                    name : '基础知识',
                    type : 'click',
                    key  : 'Linux是一套免费使用和自由传播的类Unix操作系统，是一个基于POSIX和Unix的多用户、多任务、支持多线程和多CPU的操作系统。'
                },
                {
                    name : 'linux网站',
                    type : 'view',
                    url  : 'http://linux.org'
                }]
           },
           {
                name : '发送图片',
                sub_button:[{
                    name:'拍照',
                    type:'pic_sysphoto',
                    key:'photo'
                },
                {
                    name:'相册',
                    type:'pic_weixin',
                    key:'photo_album'
                }]
           },
           {
                name : 'Help',
                type : 'click',
                key  : '你好，这是一个测试号，目前会原样返回用户输入的数据对象'
           }
    ]
}
async function createMenu(){
    let ret = await gohttp.get(token_api);
    let t = JSON.parse(ret);
    //如果没有成功获取access_token则输出错误信息并退出
    if(t.access_token === undefined){
        console.log(ret);
        process.exit(-1);
    }


var create_menu_api =
    `https://api.weixin.qq.com/cgi-bin/menu/create`
    +`?access_token=${t.access_token}`;

 ret = await gohttp.post(create_menu_api,{
    body:menu_data,
    headers:{
    //此扩展消息头的key值都应该小写
    'content-type' : 'text/plain'
    }
 });
  console.log(ret);
}
createMenu();






