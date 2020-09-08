
cc.Class({
    extends: require('UI-PanelWindow'),

    properties: {
    },

    start () {
        var tips=cc.find('view/tip',this.node).getComponent(cc.Label)
        if(global.planeId==1){
            tips.string='通过第五关将永久获得'
        }
        if(global.planeId==2){
            tips.string='第三日登陆将永久获得'
        }
    },

    onClick(e,d){
        if(d == 'continue'){
            var options={
                adUnitId:'adunit-4032c51c4c7df7f7',
                stopCb:function(){
                    global.EJMgr.showToast('视频未看完，不能获得奖励')
                },
                successCb:function(){
                    if(global.GameLoop.GameMgr){
                        // self.httpGet('')
                        global.EJMgr.popUI();
                        global.GameLoop.GameMgr.resumeGame();
                        // global.Http.get('/game/gameUser','attack',{},function(err,res){
                        // })
                    }
                }
            }
            global.WechatShare.videoOrShare(options)
        } else {
            global.EJMgr.popUI();
            global.GameLoop.enterSelectPlane();
        }
    },

});
