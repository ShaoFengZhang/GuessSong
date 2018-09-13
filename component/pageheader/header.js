Component({
    properties: {
        message: { type: String },
    },
    methods: {
        backPage: function () {
            console.log('121131313')
            wx.navigateBack({
                delta: 1
            })
        }
    }
})