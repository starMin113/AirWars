
cc.Class({
    extends: require('UI-PanelWindow'),

    properties: {
        label:cc.Label
    },

    
    onLoad(){
        this._super();
        this.label.string = 'x '+global.Data.dailyGifts.config.videoGoldCoin;
    },
    onClick(e,d){
        var self=this;
        if(d=='0'){
            self.resumGame();
        } else {
           /* CC_WECHATGAME&& global.Platform.share('还记得记忆中的雷电吗，快来跟我一起爽快射击吧',{parentId:global.Data._id},function(){
                
            },)
            var obj={
                coin:500
            }
            global.Http.get('/game/gameUser','addInviteCoin',obj,function(err,res){
                if(!err){
                    global.Data.coin += obj.coin;
                    global.Event.emit('COIN');
                    global.EJMgr.showToast('获取金币成功')
                    self.resumGame();
                }
            })*/

            var options={
                adUnitId:'adunit-2c296b5dd3cc98bb',
                stopCb:function(){
                    global.EJMgr.showToast('视频未看完，不能获得奖励')
                },
                successCb:function(){
                    self.httpGet('/game/gameUser','dailyGifts.receiveVideoGoldCoin2',{},function(err,res){
                        if(err){
                            return;
                        }
                        global.EJMgr.showToast('获取金币成功');
                        self.resumGame();
                    })
                }
            }
            global.WechatShare.videoOrShare(options)

            /*global.Platform.showVideo('adunit-6a07e5b943279784',function(finish){
                if(finish){
                    self.httpGet('/game/gameUser','dailyGifts.receiveVideoGoldCoin2',{},function(err,res){
                        if(err){
                            return;
                        }
                        global.EJMgr.showToast('获取金币成功');
                        self.resumGame();
                    })
                }
            })*/
        }
    },
    resumGame(){
        var self=this
        SoundMgr.playSound('Audio/count');
        var pause = global.UIMgr.pushUI('game/GamePause')
            pause.getComponent('GameUI-Pause').setOptions({revert:true,cb:function(){
                global.Event.emit('LUCK');
                cc.audioEngine.resumeAll();
                global.UIMgr.popUI();
            }});

        // global.UIMgr.loadLayer('GamePause',0,'GameUI-Pause',{revert:true,cb:function(){
           
        // }})
    }
});
