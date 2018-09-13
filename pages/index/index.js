const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
Page({
    data: {
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        ifShowRuleMask: false,
        ifshowNochanceMask: false,
        android: false,
        ios: false,
        showZhishi: false,
    },
    onLoad: function() {
        let _this = this;
        wx.getSystemInfo({
            success: function(res) {
                let sysytem = res.system.slice(0, 3);
                if (sysytem == 'iOS') {
                    _this.setData({
                        android: false,
                        ios: true,
                    })
                } else {
                    _this.setData({
                        android: true,
                        ios: false,
                    })
                }
            }
        })
        wx.showShareMenu({
            withShareTicket: true
        })
        wx.showLoading({
            title: '数据加载中',
            mask: true,
        })
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } else if (this.data.canIUse) {
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
                Loginfunc.checkUserInfo(app, res);
            }
        } else {
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                    Loginfunc.checkUserInfo(app, res);
                }
            })
        }
        this._createAdtwoAnimations();

        setTimeout(function() {
            _this.recommendFun();
        }, 1000);
    },

    onShow: function(e) {
        setTimeout(function() {
            _this.indexLogin();
        }, 1000);
        clearInterval(this.adTwoAniTime);
        let _this = this;
        this._createAdtwoAnimations();
        this.adTwoAniTime = setInterval(function() {
            _this.setData({
                AdtwoAnimation: _this.AdtwoAnimation
            })
        }, 8000);
        this.getAdData();
    },

    onHide: function() {
        clearInterval(this.adTwoAniTime);
    },

    onUnload: function() {
        clearInterval(this.adTwoAniTime);
    },

    getUserInfo: function(e) {
        console.log(e.detail);
        if (e.detail && e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            });
            Loginfunc.checkUserInfo(app, e.detail);
            this.startGame();
        }

    },

    // 开始游戏
    startGame: function(e) {
        let _this = this;
        if (e && parseInt(e.detail.formId) > 0) {
            let formID = e.detail.formId;
            let formIdUrl = Loginfunc.domin + `wx/user/formidAdd`;
            Loginfunc.requestURl(app, formIdUrl, "POST", {
                formid: formID
            }, function(data) {
                console.log('formIdUrl', data);
            });
        }

        wx.showLoading({
            title: 'Loading',
            mask: true,
        })

        let startGameUrl = Loginfunc.domin + `wx/opp/begin`;
        console.log(startGameUrl);
        Loginfunc.requestURl(app, startGameUrl, "POST", {}, function(data) {
            console.log('startGameUrl', data.code);
            if (data.code == 210) {
                // _this.setData({
                //     ifshowNochanceMask: true,
                // });
                wx.showModal({
                    title: '提示',
                    content: '挑战机会不足',
                    showCancel: false,
                    success: function (res) {}
                })
            };
            if (data.code == 200) {
                wx.navigateTo({
                    url: '/pages/player/player',
                })
            };
            if (data.code == 213) {
                wx.showModal({
                    title: '提示',
                    content: '挑战已经开始,请稍后再试',
                    showCancel: false,
                    success: function(res) {
                        let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
                        Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {
                            console.log('endGameUrl', data)
                        });
                    }
                })
            }
            wx.hideLoading();
        });
    },

    // 关闭没有机会弹窗
    closeNoChanceMask: function() {
        this.setData({
            ifshowNochanceMask: false,
        })
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

    // 领取机会
    toReceive: function() {
        let _this = this;
        _this.setData({
            ifShowLoginRule: false,
        });
        wx.showToast({
            title: '机会+1',
            icon: 'success',
            duration: 800,
        })
    },

    // 右边广告动画
    _createAdtwoAnimations() {
        var animate = wx.createAnimation({
            transformOrigin: "50% 50%",
            timingFunction: "ease",
            duration: 50
        });

        animate.rotate(20).step();
        animate.rotate(-20).step();
        animate.rotate(20).step();
        animate.rotate(-20).step();
        animate.rotate(0).step();
        this.AdtwoAnimation = animate.export();
    },

    // 规则弹窗开关
    switchRuleMask: function() {
        this.setData({
            ifShowRuleMask: !this.data.ifShowRuleMask
        });
    },

    // 配置信息
    indexLogin: function() {
        let _this = this;
        let indexLoginUrl = Loginfunc.domin + `wx/user/indexLoad`;
        Loginfunc.requestURl(app, indexLoginUrl, "POST", {}, function(data) {
            console.log('indexLoginUrl', data.data);
            if (data.code == 200) {
                app.globalData.user_id = data.data.uid;
                app.globalData.isExamine = data.data.isExamine;
                app.questionNum = parseInt(data.data.questionNum);
                app.minDraw = parseInt(data.data.configDrawAmountLowLimit);
                app.maxDraw = parseInt(data.data.configDrawAmountLimit);
                app.shareList = data.data.shareList;
                wx.setStorage({
                    key: "user_id",
                    data: data.data.uid
                });
                if (data.data.getLoadReward == 1) {
                    _this.setData({
                        ifShowLoginRule: true,
                    })
                };
                _this.setData({
                    pullnew: data.data.todayRecommend,
                    questionNum: parseInt(data.data.questionNum),
                    ruleimg: data.data.configImgIndexRule,
                    ifshowla: data.data.isExamine,
                })
            };
            wx.hideLoading();
        });
    },

    // 拉新接口
    recommendFun: function() {
        let recommendUrl = Loginfunc.domin + `wx/user/recommend`;
        if (app.recommendId) {
            Loginfunc.requestURl(app, recommendUrl, "POST", {
                uid: app.recommendId
            }, function(data) {
                console.log("recommendUrl", data);
                app.recommendId = null;
            })
        }
    },

    // 广告配置
    getAdData: function() {
        let _this = this;
        let AdUrl = Loginfunc.adDomin + `wx/ad/getAds`;
        Loginfunc.requestURl(app, AdUrl, "POST", {
            appId: app.globalData.appid
        }, function(data) {
            console.log("AdUrl", data.data);
            if (data.code == 200) {
                _this.OneAd = data.data.index_1;
                _this.TwoAd = data.data.index_2;
                _this.ThreeAd = data.data.index_3;
                _this.FourAd = data.data.index_4;
                _this.FiveAd = data.data.index_5;
                _this.SixAd = data.data.index_6;

                let OneAdData = util.sortingAdData(_this.OneAd.adList);
                let TwoAdData = util.sortingAdData(_this.TwoAd.adList);
                let ThreeAdData = util.sortingAdData(_this.ThreeAd.adList);
                let FourAdData = util.sortingAdData(_this.FourAd.adList);
                let FiveAdData = util.sortingAdData(_this.FiveAd.adList);
                let SixAdData = util.sortingAdData(_this.SixAd.adList);

                app.globalData.rank1Ad = data.data.rank_1;
                app.globalData.rank2Ad = data.data.rank_2;
                app.globalData.draw1Ad = data.data.draw_1;
                app.globalData.draw2Ad = data.data.draw_2;
                app.globalData.balance_flow_1Ad = data.data.balance_flow_1;
                app.globalData.play_award_get_1Ad = data.data.play_award_get_1;
                app.globalData.play_award_notice_1Ad = data.data.play_award_notice_1;
                app.globalData.play_fail_1Ad = data.data.play_fail_1;
                app.globalData.play_timeout_1Ad = data.data.play_timeout_1;

                _this.elastic = data.data.index_elastic_1.adList;
                _this.elasticArr = [];
                for (let key in _this.elastic) {
                    _this.elastic[key].adShowList = [];
                    _this.elastic[key].adShowList[0] = util.sortingAdData(_this.elastic[key].adList);
                    _this.elasticArr.push(_this.elastic[key]);
                }

                _this.setData({
                    elasticArr: _this.elasticArr,
                    OneAdData: OneAdData,
                    TwoAdData: TwoAdData,
                    ThreeAdData: ThreeAdData,
                    FourAdData: FourAdData,
                    FiveAdData: FiveAdData,
                    SixAdData: SixAdData,
                    ifShowOneAd: _this.OneAd.display == 1 ? true : false,
                    ifShowTwoAd: _this.TwoAd.display == 1 ? true : false,
                    ifShowThreeAd: _this.ThreeAd.display == 1 ? true : false,
                    ifShowFourAd: _this.FourAd.display == 1 ? true : false,
                    ifShowFiveAd: _this.FiveAd.display == 1 ? true : false,
                    ifShowSixAd: _this.SixAd.display == 1 ? true : false,
                });
                // console.log(_this.data.elasticArr);
            }
        })
    },

    // 广告点击事件
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

    collectionOur: function() {
        this.setData({
            showZhishi: true,
        })
    },

    hideinstructionsBox: function() {
        this.setData({
            showZhishi: false,
        })
    }
})