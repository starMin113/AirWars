
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setTouchEnabled(true)
        // this.isPause =  
        
    },

    setPlayer(p){
        this.player = p;
    },

    setTouchEnabled(enable){
        if(enable){
            this.node.on(cc.Node.EventType.TOUCH_START,this.onTouch.bind(this));
            this.node.on(cc.Node.EventType.TOUCH_MOVE,this.onTouch.bind(this));
            this.node.on(cc.Node.EventType.TOUCH_END,this.onTouch.bind(this));
            this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onTouch.bind(this));
        } else {
            this.node.off(cc.Node.EventType.TOUCH_START,this.onTouch.bind(this));
            this.node.off(cc.Node.EventType.TOUCH_MOVE,this.onTouch.bind(this));
            this.node.off(cc.Node.EventType.TOUCH_END,this.onTouch.bind(this));
            this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.onTouch.bind(this));
        }
    },

    onTouch(event){
        if(event.type == cc.Node.EventType.TOUCH_START){
            // global.GameLoop.GameMgr.resumeGame();
            global.GameLoop.GameMgr.isSlow = false
            // global.GameLoop.GameMgr.s_gameUI.mask.active=false
            this.lastPoint = event.touch.getStartLocation();
            return;
        }
        if(event.type == cc.Node.EventType.TOUCH_END && this.player!=null && global.canPuse){
            global.GameLoop.GameMgr.isSlow = true
            // global.GameLoop.GameMgr.pauseGame();
            // global.GameLoop.GameMgr.s_gameUI.mask.active=true
        }
        var current = event.touch.getLocation();
        var p = cc.v2(current.x-this.lastPoint.x,current.y-this.lastPoint.y)
        this.lastPoint = current;
        if(this.player){
            this.player.moveBy(p);
        }
    }

    // update (dt) {},
});
