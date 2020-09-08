
cc.Class({
    extends: require('wy-Component'),

    properties: {
    },
    onLoad(){
        this.node.on('onEnterWindowBegin',this.onEnterWindowBegin,this);
        this.node.on('onEnterWindowEnd',this.onEnterWindowEnd,this);
        this.node.on('onExitWindowBegin',this.onExitWindowBegin,this);
        this.node.on('onExitWindowEnd',this.onExitWindowEnd,this);
        this.node.on('onWindowFocus',this.onWindowFocus,this);
    },
    
    getEjectAction(){
        return [cc.scaleTo(0.2,1.05),cc.scaleTo(0.1,1.0)]
    },
    getExitAction(){
        return cc.callFunc(this.onExitWindowEnd.this);
    },
    initWindowSize(){
        for(var i=0; i<this.node.children.length; i++){
            var chd = this.node.children[i];
            if(chd.name != 'bg' && chd.name != 'mask'){
                chd.scaleX = 0.7
                chd.scaleY = 0.7
            }
            chd.opacity = 0;
        }
    },
    //离场方法
    addExitMothod(func){
        if(!this._exitModthod){
            this._exitModthod = [];
        }
        this._exitModthod.push(func)
    },
    _executeExitMothod(){
        if(this._exitModthod){
            for(var i=0; i<this._exitModthod.length; i++){
                this._exitModthod[i]();
            }
        }
    },
    //即将打开窗口 (前面的窗口需要多久的动画时间)
    onEnterWindowBegin(){
        var f = true;
        for(var i=0; i<this.node.children.length; i++){
            var chd = this.node.children[i];
            if(chd.name == 'bg' || chd.name == 'mask'){
                chd.runAction(cc.fadeTo(0.15,150));
            } else {
                var actions = this.getEjectAction();
                if(f){
                    actions.push(cc.callFunc(this.onEnterWindowEnd.bind(this)))
                    f = false;
                }
                
                chd.runAction(cc.sequence(actions))
                chd.runAction(cc.fadeIn(0.2));
            }
        }
    },
    //打开窗口完成
    onEnterWindowEnd(){
        // cc.log('onEnterWindowEnd')
    },
    //即将关闭窗口 告诉别人你要多久才能关闭
    onExitWindowBegin(){ 
        var f = false;
        for(var i=0; i<this.node.children.length; i++){
            var chd = this.node.children[i];
            chd.stopAllActions();
            if(chd.name == 'bg' || chd.name == 'mask'){
                chd.runAction(cc.fadeOut(0.2));
            } else {
                chd.runAction(cc.spawn(cc.scaleTo(0.2,0.7),cc.fadeOut(0.2)))
            }
            if(!f){
                chd.runAction(cc.sequence(cc.delayTime(0.2),cc.callFunc(this.onExitWindowEnd.bind(this))));
            }
        }
        return 0;
    },
    //关闭窗口完成
    onExitWindowEnd(){
        this._executeExitMothod();
    },
    //重新获取窗口焦点
    onWindowFocus(){

    },

    removeFromUI(event,data){
        SoundMgr.playButtonEffect()
        SoundMgr.playMusic('./Audio/bgm_main')
        if(data == 1){
            global.EJMgr.popUI()
        } else {
            global.UIMgr.popUI();
        }
    }
});
