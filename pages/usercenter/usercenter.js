const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
Page({

    data: {
        recordlistHeight: '34vh',
    },
    onLoad: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
    },

    onShow: function() {
        let _this = this;
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        });
        if (!this.data.userInfo && app.globalData.userInfo) {
            app.globalData.userInfo.nickName = app.globalData.userInfo.nickName.slice(0, 12);
            this.setData({
                userInfo: app.globalData.userInfo,
            })
        }
        if (app.globalData.userInfo) {

            this.getpageData();
        } else {
            wx.hideLoading();
        }
        if (app.globalData.balance_flow_1Ad) {
            let OneAd = util.sortingAdData(app.globalData.balance_flow_1Ad.adList);
            this.setData({
                OneAd: OneAd,
                ifShowOneAd: app.globalData.balance_flow_1Ad.display == 1 ? true : false,
            })
            console.log(OneAd)
        };
        wx.createSelectorQuery().select('.listbotad').boundingClientRect(function(rect) {

            let h = rect.height;
            console.log(h);
            if (h == 0) {
                _this.setData({
                    recordlistHeight: '51vh'
                })
            };
        }).exec()
    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onShareAppMessage: function (res) {
        let _this = this;
        let shareGetChanceUrl = Loginfunc.domin + `wx/opp/shareAddOpp`;
        let random = Math.floor(Math.random() * app.shareList.length);
        let groupCheckUrl = Loginfunc.domin + `wx/opp/shareAddOppEncrypt`;
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `${app.globalData.appUrl}storage/${app.shareList[random].pic}`,
            success: function (data) {
                console.log("?????????????", data);
                _this.setData({
                    ifshowNochanceMask: false,
                });
                console.log('90', data);
                if (data && data.shareTickets) {
                    wx.getShareInfo({
                        shareTicket: data.shareTickets[0],
                        success: function (value) {
                            console.log('94', value);
                            let iv = value.iv;
                            let encryptedData = value.encryptedData;
                            Loginfunc.requestURl(app, groupCheckUrl, "POST", {
                                encryptedData: encryptedData,
                                iv: iv
                            }, function (data) {
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
            fail: function (data) {
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

    getpageData: function() {
        let _this = this;
        let getpageDataUrl = Loginfunc.domin + `wx/user/myReward`;
        Loginfunc.requestURl(app, getpageDataUrl, "POST", {}, function(data) {
            if (data.code == 200) {
                console.log('getpageDataUrl', data.data);
                for (let i = 0; i < data.data.award_list.length; i++) {
                    data.data.award_list[i].year = data.data.award_list[i].created_at.slice(0, 10);
                    data.data.award_list[i].time = data.data.award_list[i].created_at.slice(11);
                }
                _this.setData({
                    avtime: data.data.avtime,
                    accumulative: data.data.accumulative,
                    available: data.data.available,
                    award_number: data.data.award_number,
                    award_list: data.data.award_list,
                })
            };
            wx.hideLoading();
        });
    },

    goWithdrawal: function(e) {
        let money = this.data.available;
        wx.navigateTo({
            url: `/pages/withdraw/withdraw?money=${money}`,
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