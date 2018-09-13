import LoginFunc from './utils/loginfunc.js';
const ald = require('./utils/ald-stat.js');
App({
    onLaunch: function(options) {
        var _this = this;
        LoginFunc.wxloginfnc(this);
        LoginFunc.getSettingfnc(this);
    },
    onShow: function (options){
        if (options.query&&options.query.uid) {
            this.recommendId = options.query.uid;
            console.log("APPOPTIONS", options.query.uid);
        };
    },
    globalData: {
        userInfo: null,
        appid:"wx8f1c6f7b898c15ac",
        appUrl:'https://xcx6.18yx.com/'
    }
})