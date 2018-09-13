const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
Component({
    properties: {
        expression: {
            type: String
        },
        textcolor: {
            type: String
        },
        answerflg: {
            type: String
        },
        btntext: {
            type: String
        },
        songName: {
            type: String
        },
        ifShowDraw: {
            type: Boolean
        },
        masktap: {
            type: String
        },
        ifshowmaskAD: {
            type: Boolean
        },
        ifShowShareBtn: {
            type: Boolean
        },
        page:{
            type:Object,
        }
    },
    methods: {
        nextMusic: function() {
            console.log('nextMusic');
        },
        continueGame: function(e) {
        },
        aboutFriend: function() {
            console.log('aboutFriend');
        },
        adclickevent: function() {
            console.log('adclickevent');
        }
    }
})