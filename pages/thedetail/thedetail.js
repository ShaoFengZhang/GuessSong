const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
Page({

    data: {

    },

    onLoad: function(options) {
        this.getDetailData();
    },

    onShow: function() {

    },

    onShareAppMessage: function() {
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `${app.globalData.appUrl}storage/${app.shareList[random].pic}`,
        };
    },

    getDetailData: function() {
        let _this = this;
        let getDetailDataUrl = Loginfunc.domin + `wx/user/balanceFlowDetail`;
        Loginfunc.requestURl(app, getDetailDataUrl, "POST", {}, function(data) {
            console.log("getDetailDataUrl", data);
            if (data.code == 200) {
                let award_list = data.data || [];
                for (let i = 0; i < award_list.length; i++) {
                    award_list[i].year = award_list[i].created_at.slice(0, 10);
                    award_list[i].time = award_list[i].created_at.slice(11);
                }
                _this.setData({
                    award_list: award_list
                });
            }

        })
    },


})