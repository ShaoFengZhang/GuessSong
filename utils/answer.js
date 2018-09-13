let answerOK = {
    songName: '海阔天空',
    textcolor: '#26A69A',
    answerflg: "回答正确",
    btntext: '下一首',
    expression: '/assets/mask/smile.png',
    ifShowDraw: false,
    masktap: 'nextMusic',
    ifshowmaskAD: false,
    add:0,
};

let answerError = {
    songName: '点击广告继续下一题',
    textcolor: '#E56B36',
    answerflg: "回答错误",
    btntext: '返回首页',
    expression: '/assets/mask/cry.png',
    ifShowDraw: false,
    masktap: 'continueGame',
    ifshowmaskAD: true,
    add:1,
};

let answerDraw = {
    songName: '你没有选择答案下次快点答题哟',
    btntext: '重新再来',
    expression: '/assets/mask/draw.png',
    ifShowDraw: true,
    masktap: 'aboutFriend',
    ifshowmaskAD: true,
    add:0,
    // ifShowShareBtn:true,
};

module.exports = {
    answerOK: answerOK,
    answerError: answerError,
    answerDraw: answerDraw,
}