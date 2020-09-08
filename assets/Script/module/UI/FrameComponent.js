var FrameManager = require('FrameManager')

cc.Class({
    extends: cc.Component,

    properties: {
        autoUpdate : true
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    setAutoUpdate(r){
        if(r == this.autoUpdate){
            return;
        }
        this.autoUpdate = r;
        if(!r){
            FrameManager.add(this)
        } else {
            FrameManager.remove(this);
        }
    },

    onDestroy(){
        if(!this.autoUpdate){
            FrameManager.remove(this)
        }
        this.autoUpdate = true;
    },

    start () {

    },

    // update (dt) {},
    gameUpdate(dt){

    }
});
