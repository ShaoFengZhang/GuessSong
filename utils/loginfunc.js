const domin = "https://xcx6.18yx.com/";
const adDomin = "https://xcx7.18yx.com/";
const LoginURl = `${domin}wx/user/login`;
const checkUserUrl = `${domin}wx/user`;
import md5 from './md5.js';

const md5pition = (data) => {
    let secret = 'sld4s34f2o5sWe';
    data.timestamp = Date.parse(new Date());
    let str = '';
    let arr = Object.keys(data).sort();
    for (var i in arr) {
        if (arr[i] === 'signature') {
            continue
        }
        if (str !== '') {
            str += '&'
        }
        if (data[arr[i]]) {
            str += arr[i] + '=' + encodeURI(data[arr[i]])
        }
    };
    if (str !== '') {
        str += '&'
    };
    str += 'secret=' + secret;
    let encrypted = md5.hexMD5(str).toUpperCase();
    data.signature = encrypted;
    return data;
};

const wxloginfnc = (app) => {
    wx.login({
        success: res => {
            let data = {
                code: res.code
            };
            let data2 = md5pition(data);
            wx.request({
                url: LoginURl,
                method: "POST",
                data: data2,
                success: function(value) {
                    app.globalData.user_session = value.data.data;
                    wx.setStorageSync('user_session', value.data.data);
                }
            });
        },
    })
};

const getSettingfnc = (app) => {
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                    lang: "zh_CN",
                    success: res => {
                        app.globalData.userInfo = res.userInfo;
                        checkUserInfo(app, res);
                        if (app.userInfoReadyCallback) {
                            app.userInfoReadyCallback(res);
                        }
                    }
                })
            }
        }
    })
};

const checkUserInfo = (app, res) => {
    if (wx.getStorageSync('rawData') != res.rawData) {
        wx.setStorage({
            key: "rawData",
            data: res.rawData
        })
        requestURl(app, checkUserUrl, "POST", {
            encryptedData: res.encryptedData,
            iv: res.iv
        }, function(data) {
            console.log('checkUser', data);
        });
    }
};

const requestURl = (app, url, method, data, cb) => {
    let data2 = md5pition(data);
    wx.request({
        url: url,
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': '+json',
            'cookie': 'SESSION=' + wx.getStorageSync('user_session')
        },
        data: data2,
        method: method,
        success: function(resdata) {
            if (resdata.data.code == 201) {
                wxloginfnc(app);
                requestURl(app, url, method, data, cb);
            } else {
                cb(resdata.data);
            }
        },
        fali: function() {
            wx.showToast({
                title: "网络异常",
                icon: 'loading',
                duration: 2000
            })
        }
    })
};

module.exports = {
    wxloginfnc: wxloginfnc,
    getSettingfnc: getSettingfnc,
    checkUserInfo: checkUserInfo,
    requestURl: requestURl,
    domin: domin,
    adDomin: adDomin,
}