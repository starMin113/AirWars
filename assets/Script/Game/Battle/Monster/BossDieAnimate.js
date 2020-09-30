
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.no_heng = this.node.getChildByName('heng');
        this.no_shu = this.node.getChildByName('shu');
        this.no_center = this.node.getChildByName('center');
        this.play(function(){
            global.bossDieCount++;
            cc.log('完成')
            if(global.gates==0 && global.bossDieCount%2==0){
                global.GameLoop.GameMgr.onAfterVideo()
            }
        });
    },

    play(cb){
        this.cb = cb;
        function init(no){
            no.scale = 0.1;
            no.opacity = 255;
        }
        function hide(no){
            no.scale = 0.1;
            no.opacity = 0;
        }
        function scale(){
            return cc.scaleTo(0.5,1.0)
        }
        var heng = cc.sequence(cc.callFunc(init),cc.scaleTo(0.5,1.0),cc.callFunc(hide),
                cc.callFunc(init),cc.scaleTo(0.5,1.0),cc.callFunc(hide),cc.delayTime(0.7),cc.callFunc(init),cc.spawn(cc.scaleTo(0.5,5.0),cc.fadeOut(0.5)),cc.delayTime(0.2),cc.callFunc(cb));
        var shu = cc.sequence(cc.callFunc(init),cc.delayTime(0.25), cc.scaleTo(0.5,1.0),cc.callFunc(hide),
                cc.callFunc(init),cc.scaleTo(0.5,1.0),cc.callFunc(hide),cc.delayTime(0.3),cc.callFunc(init),cc.spawn(cc.scaleTo(0.5,5.0),cc.fadeOut(0.5)));       
        this.no_heng.runAction(heng);
        this.no_shu.runAction(shu);
        var center = cc.sequence(cc.callFunc(hide),cc.delayTime(0.8),cc.callFunc(init),cc.spawn(cc.scaleTo(1,10.0),cc.fadeOut(1)))
        this.no_center.runAction(center)
    }

});
