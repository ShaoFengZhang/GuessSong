Page({

    data: {

    },

    onLoad: function(options) {
        if (options && options.url) {
            this.setData({
                weburl: options.url
            })
        }
    },

    onReady: function() {

    },

    onShow: function() {

    },

    onHide: function() {

    },

    onUnload: function() {

    },


    onShareAppMessage: function(options) {
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.globalData.user_id}`,
            imageUrl: `${app.globalData.appUrl}storage/${app.shareList[random].pic}`,
        };
    }
})