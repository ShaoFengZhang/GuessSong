const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {
        scrollboxHeight: '730rpx',
    },

    onLoad: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
    },

    onShow: function() {
        let _this = this;
        this.getBondList();
        if (app.globalData.rank1Ad) {
            let rankOneAd = util.sortingAdData(app.globalData.rank1Ad.adList);
            this.setData({
                rankOneAd: rankOneAd,
                ifShowRankOneAd: app.globalData.rank1Ad.display == 1 ? true : false,
            })
        };

        if (app.globalData.rank2Ad) {
            let rankTwoAd = util.sortingAdData(app.globalData.rank2Ad.adList);
            this.setData({
                rankTwoAd: rankTwoAd,
                ifShowRankTwoAd: app.globalData.rank2Ad.display == 1 ? true : false,
            })
        };

        wx.createSelectorQuery().selectAll('.rankadbox').boundingClientRect(function(rect) {

            let h = rect[0].height + rect[1].height;
            if (h == 0) {
                _this.setData({
                    scrollboxHeight: '96vh'
                })
            };
            if (rect[0].height || rect[1].height) {
                _this.setData({
                    scrollboxHeight: '83vh'
                })
            };
            if (rect[0].height && rect[1].height) {
                _this.setData({
                    scrollboxHeight: '730rpx'
                })
            };

        }).exec()

    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onShareAppMessage: function(res) {
        let _this = this;
        let shareGetChanceUrl = Loginfunc.domin + `wx/opp/shareAddOpp`;
        let random = Math.floor(Math.random() * app.shareList.length);
        let groupCheckUrl = Loginfunc.domin + `wx/opp/shareAddOppEncrypt`;
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `https://www.vryzy.cn/storage/${app.shareList[random].pic}`,
            success: function(data) {
                console.log("?????????????", data);
                _this.setData({
                    ifshowNochanceMask: false,
                });
                console.log('90', data);
                if (data && data.shareTickets) {
                    wx.getShareInfo({
                        shareTicket: data.shareTickets[0],
                        success: function(value) {
                            console.log('94', value);
                            let iv = value.iv;
                            let encryptedData = value.encryptedData;
                            Loginfunc.requestURl(app, groupCheckUrl, "POST", {
                                encryptedData: encryptedData,
                                iv: iv
                            }, function(data) {
                                console.log('groupCheckUrl', data);
                                if (data.code == 200) {
                                    wx.showToast({
                                        title: '机会+1',
                                        icon: 'success',
                                        // duration: 3000
                                    })
                                };
                                if (data.code == 210) {
                                    wx.showToast({
                                        title: data.msg,
                                        icon: 'none',
                                        // duration: 3000
                                    })
                                };
                                if (data.code == 211) {
                                    wx.showToast({
                                        title: '今日分享已达上限',
                                        icon: 'none',
                                        // duration: 3000
                                    })
                                };
                            });
                        }
                    });

                } else {
                    wx.showToast({
                        title: '请分享到群',
                        icon: 'none',
                        duration: 1200
                    })
                }

            },
            fail: function(data) {
                console.log("fail", data);
                _this.setData({
                    ifshowNochanceMask: false,
                });
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                    duration: 1200
                })
            }
        };
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

    getBondList: function() {
        let _this = this;
        let getBondListUrl = Loginfunc.domin + `wx/user/rankList`;
        Loginfunc.requestURl(app, getBondListUrl, "POST", {}, function(data) {
            console.log("getBondListUrl", data);
            if (data.code == 200) {
                let iteamArr = data.data || [];
                for (let i = 0; i < iteamArr.length; i++) {
                    iteamArr[i].nick_name = iteamArr[i].nick_name.slice(0, 10);
                };
                _this.setData({
                    iteamArr: iteamArr
                });
            }

        })
    },
})