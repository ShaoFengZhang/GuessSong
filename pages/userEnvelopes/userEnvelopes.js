const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {

    },

    onLoad: function(options) {
        app.globalData.userInfo.nickName = app.globalData.userInfo.nickName.slice(0, 8);
        this.setData({
            userinfo: app.globalData.userInfo,
            userGetRedNum: app.globalData.userGetRedNum,
        });

    },

    onShow: function() {
        if (app.globalData.play_award_get_1Ad) {
            let OneAd = util.sortingAdData(app.globalData.play_award_get_1Ad.adList);
            this.setData({
                OneAd: OneAd,
                ifShowOneAd: app.globalData.play_award_get_1Ad.display == 1 ? true : false,
            })
            console.log(OneAd)
        };
    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onShareAppMessage: function() {
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `${app.globalData.appUrl}storage/${app.shareList[random].pic}`,
        };
    },

    continueChalleg: function() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    CheckTheReward: function() {
        wx.switchTab({
            url: '/pages/usercenter/usercenter'
        })
    },

    adClickEvent: function(e) {
        let _this = this;
        let adId = e.currentTarget.dataset.adid;
        let AdClickUrl = Loginfunc.adDomin + `wx/ad/adHit`;
        Loginfunc.requestURl(app, AdClickUrl, "POST", {
            id: adId
        }, function(data) {
            console.log('AdClickUrl', data)
        })
    },
})