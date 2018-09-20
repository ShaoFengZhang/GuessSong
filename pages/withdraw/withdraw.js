const app = getApp();
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {
        showADBox: false,
        showinput: true,
    },

    onLoad: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        })
        if (options) {
            this.money = parseFloat(options.money);
            this.setData({
                userbalance: this.money,
            })
        };
        console.log(this.money);
        this.adclick = false;
    },

    onShow: function() {
        let _this = this;
        if (app.globalData.draw1Ad) {
            let OneAd = util.sortingAdData(app.globalData.draw1Ad.adList);
            this.setData({
                OneAd: OneAd,
                ifShowOneAd: app.globalData.draw1Ad.display == 1 ? true : false,
            })
            console.log(OneAd)
        };
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

    // 输入框输入时
    getinputvalue: function(e) {
        let inputvalue = (Math.floor(parseFloat(e.detail.value) * 100) / 100).toFixed(2);

        this.drawamount = parseFloat(inputvalue);

    },

    // 全部提现按钮
    allwithdraw: function () {
        console.log('allwithdraw');
        let withDrawUrl = Loginfunc.domin + `wx/user/withDraw`;
        if (!this.data.userbalance || this.data.userbalance < app.minDraw) {
            wx.showModal({
                title: '提示',
                content: `余额大于${app.minDraw}元才可提现`,
                showCancel: false,
                success: function (res) {
                    return;
                }
            });
            return;
        };
        Loginfunc.requestURl(app, withDrawUrl, "POST", {
            amount: this.data.userbalance
        }, function (data) {
            console.log('withDrawUrl', data);
            if (data.code == 200) {
                wx.showModal({
                    title: '提示',
                    content: '提现成功！提现金额将在1-5个工作日打到您的微信零钱中请注意查看。',
                    showCancel: false,
                    success: function (res) {
                        wx.switchTab({
                            url: '/pages/usercenter/usercenter'
                        })
                     }
                })
            } else {
                wx.showModal({
                    title: '提现失败',
                    content: `${data.msg}`,
                    showCancel: false,
                    success: function (res) { }
                })
            }
        });
    },

    // 提现按钮
    withdraw: function () {
        let _this = this;
        let checkmoney = this.drawamount;
        let withDrawUrl = Loginfunc.domin + `wx/user/withDraw`;
        console.log(checkmoney);
        if (checkmoney == "NaN") {
            wx.showModal({
                title: '提示',
                content: '请填写提现金额',
                showCancel: false,
                success: function (res) { }
            });
            return;
        };

        if (checkmoney) {
            if (checkmoney < app.minDraw) {
                wx.showModal({
                    title: '提示',
                    content: `提现金额不得小于${app.minDraw}元`,
                    showCancel: false,
                    success: function (res) {
                        return;
                    }
                })
                return;
            };
            if (checkmoney > this.data.userbalance) {
                wx.showModal({
                    title: '提示',
                    content: '提现金额不能高于账户余额',
                    showCancel: false,
                    success: function (res) {
                        return;
                    }
                });
                return;
            };
            if (checkmoney >= app.minDraw && checkmoney <= this.data.userbalance) {
                Loginfunc.requestURl(app, withDrawUrl, "POST", {
                    amount: checkmoney
                }, function (data) {
                    console.log('withDrawUrl', data);
                    if (data.code == 200) {
                        wx.showModal({
                            title: '提示',
                            content: '提现成功！提现金额将在1-5个工作日打到您的微信零钱中请注意查看。',
                            showCancel: false,
                            success: function (res) { 
                                wx.switchTab({
                                    url: '/pages/usercenter/usercenter'
                                })
                            }
                        })
                    }else{
                        wx.showModal({
                            title: '提现失败',
                            content: `${data.msg}`,
                            showCancel: false,
                            success: function (res) {}
                        }) 
                    }
                   
                });
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '请填写提现金额',
                showCancel: false,
                success: function (res) { }
            })
        };
    },


    // 输入框获得焦点时
    inputfocus: function(e) {
        this.drawamount = null;
        this.setData({
            inputvalue: null,
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

    gotoDetial: function() {
        wx.navigateTo({
            url: '/pages/thedetail/thedetail',
        })
    },

    deawAdClick: function() {
        this.adclick = true;
    }
})