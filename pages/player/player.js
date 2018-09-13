const app = getApp();
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
import answerflg from '../../utils/answer.js';
const stepcfg = {
    timingFunction: "step-end",
    duration: 10
};

Page({
    data: {
        answerflg: answerflg.answerOK,
        ifplaymask: false,
        ifshowbg: false,
        ifShowGetRedBao: false,
        current_step: 1,
        answerOKIcon: [false, false, false, false],
        answerERRORIcon: [false, false, false, false],
    },

    onLoad: function(options) {
        console.log('onLoad');
        let _this = this;
        this.setData({
            userinfo: app.globalData.userInfo,
            questionNum: app.questionNum,
        });
        this._createPointerAnimations();
        this._createReadyAnimations();
        this.audioReady();
        this.readyTime = setTimeout(function() {
            _this.setData({
                readyAnimation: _this.readyAnimation,
            })
        }, 150)
        this.getTime = setTimeout(function() {
            _this.getAnswerTitle();
        }, 1300)
        this.rebirth = false;
        this.chance = 1;
        this.audioSuccess();
    },

    onShow: function() {
        let _this = this;
        console.log('onShow');
        if (this.soccerAudio && !this.havechoose) {
            this.soccerAudio.play();
        };

        if (app.globalData.play_fail_1Ad) {
            let ErrorAd = util.sortingAdData(app.globalData.play_fail_1Ad.adList);
            this.ErrorAd = ErrorAd;
            this.ifshowmaskErrorAD = app.globalData.play_fail_1Ad.display == 1 ? true : false;
        };

        if (app.globalData.play_timeout_1Ad) {
            let TimeoutAd = util.sortingAdData(app.globalData.play_timeout_1Ad.adList);
            this.TimeoutAd = TimeoutAd;
            this.ifshowmaskTimeoutAD = app.globalData.play_timeout_1Ad.display == 1 ? true : false;
        };

        if (app.globalData.play_award_notice_1Ad) {
            console.log(app.globalData.play_award_notice_1Ad.adList);
            let noticetAd = util.sortingAdData(app.globalData.play_award_notice_1Ad.adList);
            this.setData({
                noticetAd: noticetAd,
                ifShowNoticetAd: app.globalData.play_award_notice_1Ad.display == 1 ? true : false,
            })
        };

        if (this.rebirth) {
            this.rebirth = false;
            this.chance = 2;
            wx.showToast({
                title: '成功复活,开始下一题',
                icon: 'none',
                duration: 1000
            });
            this.getAnswerTitle();
        };
    },

    onHide: function() {
        if (this.soccerAudio) {
            this.soccerAudio.stop();
        }
        if (this.successrAudio) {
            this.successrAudio.stop();
        }
        if (this.chooseAudio) {
            this.chooseAudio.stop();
        }

        clearTimeout(this.readyTime);
        clearTimeout(this.getTime);
        console.log('onhide');
    },

    onUnload: function() {
        this.destroy();
        if (this.successrAudio) {
            this.successrAudio.destroy();
        }
        if (this.chooseAudio) {
            this.chooseAudio.destroy();
        }

        let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
        Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {
            console.log('endGameUrl', data)
        });
        if (this.soccerAudio) {
            this.soccerAudio.stop();
        }
        console.log('onUnload');
    },

    onShareAppMessage: function(e) {
        let shareType = e.from;
        if (shareType == "button") {
            let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
            Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {});
            wx.switchTab({
                url: '/pages/index/index'
            })
        }
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `${app.globalData.appUrl}storage/${app.shareList[random].pic}`,
        };
    },

    aboutFriend: function() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    destroy: function() {
        clearTimeout(this.showMaskTime);
        clearTimeout(this.showTime);
        clearTimeout(this.showAniTime);
        clearTimeout(this.readyTime);
        clearTimeout(this.getTime);
    },

    nextMusic: function() {
        console.log('nextMusic');
        answerflg.answerOK.masktap = "";
        this.setData({
            answerflg: answerflg.answerOK
        });
        this.soccerAudio.destroy();
        this.getAnswerTitle();
        // this.setData({
        //     ifplaymask: false,
        //     ifshowbg: true,
        // })
    },

    continueGame: function(e) {
        this.soccerAudio.destroy();
        let _this = this;
        let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
        Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {});
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    gotoEnvelopes: function() {
        this.successrAudio.destroy()
        wx.redirectTo({
            url: '/pages/userEnvelopes/userEnvelopes'
        })
    },

    chooseanswer: function(e) {
        clearTimeout(this.audioCutDownTime);
        console.log(this.chooseAudio)
        if (this.chooseAudio) {
            this.chooseAudio.destroy();
        }
        this.havechoose = true;
        this.soccerAudio.pause();
        this.soccerAudio.seek(0);
        let subAnswer = e.currentTarget.dataset.answerindex;
        let index = e.currentTarget.dataset.index;
        let answer = "《" + e.currentTarget.dataset.answer + "》";
        let _this = this;
        _this.setData({
            chooseanswer: null,
        });
        let chooseAnswerUrl = Loginfunc.domin + `wx/opp/answer`;
        Loginfunc.requestURl(app, chooseAnswerUrl, "POST", {
            answer: subAnswer
        }, function(data) {
            console.log('chooseAnswerUrl', data);
            if (data.code == 200) {
                if (data.data == 1) {
                    for (let i = 0; i < _this.data.answerOKIcon.length; i++) {
                        if (i == index) {
                            _this.data.answerOKIcon[i] = true;
                            _this.data.answerbgColor[i] = 'linear-gradient(to right, #74D779, #26A69A)'
                        }
                    };
                    answerflg.answerOK.songName = answer;
                    _this.setData({
                        answerOKIcon: _this.data.answerOKIcon,
                        chooseanswer: null,
                        answerbgColor: _this.data.answerbgColor,
                    });
                    _this.chooseAudioFun('/assets/player/ok.mp3');
                    if (_this.data.current_step == app.questionNum) {
                        let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
                        Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {
                            if (data.code == 200) {
                                app.globalData.userGetRedNum = parseFloat(data.data.amount);
                                console.log(app.globalData.userGetRedNum);
                            }
                        });
                        _this.setData({
                            ifShowGetRedBao: true,
                            ifshowbg: false,
                            ifplaymask: false,
                        });
                        _this.successrAudio.play();
                        return;
                    }
                    _this.showMaskTime = setTimeout(function() {
                        _this.setData({
                            ifplaymask: true,
                            answerflg: answerflg.answerOK,
                            ifshowbg: false,
                            ifshowmaskAd: false,
                        });
                        _this.soccerAudio.play();
                    }, 1000);
                } else {
                    for (let i = 0; i < _this.data.answerERRORIcon.length; i++) {
                        if (i == index) {
                            _this.data.answerERRORIcon[i] = true;
                            _this.data.answerbgColor[i] = 'linear-gradient(to right, #EEAE69, #FDA085)'
                        }
                    };
                    _this.setData({
                        answerERRORIcon: _this.data.answerERRORIcon,
                        chooseanswer: null,
                        answerbgColor: _this.data.answerbgColor,
                    });
                    _this.chooseAudioFun('/assets/player/error.mp3');
                    _this.ifshowmaskAd = true;
                    answerflg.answerError.songName = "点击广告开始下一题"
                    if (_this.chance == 2) {
                        answerflg.answerError.songName = "返回首页继续游戏";
                        _this.ifshowmaskAd = false;
                    };
                    _this.showMaskTime = setTimeout(function() {
                        _this.setData({
                            ifplaymask: true,
                            answerflg: answerflg.answerError,
                            ifshowbg: false,
                            page: _this,
                            ifshowmaskAd: _this.ifshowmaskAd,
                            ifshowmaskErrorAD: _this.ifshowmaskErrorAD,
                            ErrorAd: _this.ErrorAd,
                        });
                    }, 1000);
                }
            }
        });
        if (this.data.cddiscani) {
            this.setData({
                cddiscani: null,
                wavesani: null,
                LeftplayAniLength: 'leftcircle pause',
                RightplayAniLength: 'rightcircle pause',
                PointerAnimation: this.reversePointerAnimation,
            })
        }
    },

    getAnswerTitle: function() {
        answerflg.answerOK.masktap = "nextMusic";
        this.havechoose = false;
        this.setData({
            answerOKIcon: [false, false, false, false],
            answerERRORIcon: [false, false, false, false],
            chooseanswer: 'chooseanswer',
            answerbgColor: ['linear-gradient(to right, #ad64f3, #7977fc)', 'linear-gradient(to right, #ad64f3, #7977fc)', 'linear-gradient(to right, #ad64f3, #7977fc)', 'linear-gradient(to right, #ad64f3, #7977fc)'],
        });
        let _this = this;
        let assetsUrl = "${app.globalData.appUrl}storage/";
        let getAnswerTitleUrl = Loginfunc.domin + `wx/opp/question`;
        Loginfunc.requestURl(app, getAnswerTitleUrl, "POST", {}, function(data) {
            console.log('getAnswerTitleUrl', data);
            if (data.code == 200) {
                for (let i = 0; i < data.data.option.length; i++) {
                    data.data.option[i].value = data.data.option[i].value.slice(0, 8);
                };
                let audioSrc = assetsUrl + data.data.link;
                console.log(audioSrc);
                _this.audioFunc(audioSrc);
                _this.showTime = setTimeout(function() {
                    _this.setData({
                        ifshowbg: true,
                        ifplaymask: false,
                        current_step: data.data.current_step,
                        answerArr: data.data.option,
                        LeftplayAniLength: 'leftcircle',
                        RightplayAniLength: 'rightcircle',

                    });
                }, 100)

                _this.showAniTime = setTimeout(function() {
                    _this.setData({
                        PointerAnimation: _this.PointerAnimation,
                        cddiscani: 'cddiscani',
                        wavesani: "wavesani",
                    })
                }, 200);
                _this.audioCutDownTime = setTimeout(function() {
                    _this.soccerAudio.destroy();
                    _this.havechoose = true;
                    _this.setData({
                        ifplaymask: true,
                        answerflg: answerflg.answerDraw,
                        ifshowbg: false,
                        cddiscani: null,
                        wavesani: null,
                        LeftplayAniLength: 'leftcircle pause',
                        RightplayAniLength: 'rightcircle pause',
                        PointerAnimation: _this.reversePointerAnimation,
                        ifshowmaskAd: true,
                        ifshowmaskErrorAD: _this.ifshowmaskTimeoutAD,
                        ErrorAd: _this.TimeoutAd
                    });
                }, 14800);
            };
            if (data.code == 211) {
                wx.showModal({
                    title: '提示',
                    content: '未开始答题,请返回首页',
                    showCancel: false,
                    success: function(res) {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    }
                })
            };
            if (data.code == 212) {
                wx.showModal({
                    title: '提示',
                    content: '没有机会了,请返回首页',
                    showCancel: false,
                    success: function(res) {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    }
                })
            };
            if (data.code == 214) {
                let endGameUrl = Loginfunc.domin + `/wx/opp/end`;
                Loginfunc.requestURl(app, endGameUrl, "POST", {}, function(data) {
                    if (data.code == 200) {
                        app.globalData.userGetRedNum = parseFloat(data.data.amount);
                        console.log(app.globalData.userGetRedNum);
                        _this.setData({
                            ifShowGetRedBao: true,
                            ifshowbg: false,
                            ifplaymask: false,
                        });
                        _this.successrAudio.play();
                    }
                });

            };
        });
    },

    _createPointerAnimations() {
        var animate = wx.createAnimation({
            transformOrigin: "78rpx 54rpx",
            timingFunction: "ease",
            duration: 2000
        });

        animate.rotate(2).step();
        this.PointerAnimation = animate.export();

        var animate = wx.createAnimation({
            transformOrigin: "78rpx 54rpx",
            timingFunction: "ease",
            duration: 500
        });

        animate.rotate(-40).step();
        this.reversePointerAnimation = animate.export();
    },

    audioFunc: function(src) {
        this.soccerAudio = wx.createInnerAudioContext();
        this.soccerAudio.autoplay = false;
        this.soccerAudio.src = src;
        this.soccerAudio.play();
    },

    chooseAudioFun: function(src) {
        this.chooseAudio = wx.createInnerAudioContext();
        this.chooseAudio.autoplay = false;
        this.chooseAudio.src = src;
        this.chooseAudio.play();
    },

    adClickEvent: function(e) {
        let addchance = e.currentTarget.dataset.addchance;
        console.log(addchance);
        let _this = this;
        if (addchance == 1) {
            this.rebirth = true;
            let adurl = Loginfunc.domin + `wx/opp/adClick`;
            Loginfunc.requestURl(app, adurl, "POST", {}, function(data) {
                console.log('adurl', data);
            })
        }

        let adId = e.currentTarget.dataset.adid;
        let AdClickUrl = Loginfunc.adDomin + `wx/ad/adHit`;
        Loginfunc.requestURl(app, AdClickUrl, "POST", {
            id: adId
        }, function(data) {
            console.log('AdClickUrl', data);
        })
    },

    audioSuccess: function() {
        this.successrAudio = wx.createInnerAudioContext();
        this.successrAudio.autoplay = false;
        this.successrAudio.src = '/assets/player/success.mp3';
    },

    audioReady: function() {
        this.ReadyAudio = wx.createInnerAudioContext();
        this.ReadyAudio.autoplay = false;
        this.ReadyAudio.src = '/assets/player/ready.mp3';
        this.ReadyAudio.play();
    },

    _createReadyAnimations() {
        let animate = wx.createAnimation({
            timingFunction: "linear",
            duration: 1200
        });
        animate.scale(1.2).step(stepcfg);
        animate.scale(0.8).opacity(0).step({
            timingFunction: "linear",
            duration: 1200
        });
        this.readyAnimation = animate.export();
    },
})