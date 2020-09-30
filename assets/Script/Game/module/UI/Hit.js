
cc.Class({
    extends: require('wy-Component'),

    properties: {
        frames : [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //  this.node.scale=0;
         this.icon = this.node.getChildByName('icon').getComponent(cc.Sprite);
    },
    start(){
    },
    setOptions(id){
    //    this.icon.spriteFrame = this.frames[id-1];

        this.node.runAction(cc.sequence(cc.delayTime(0.3),cc.callFunc((no)=>{
            global.NodePool.put('bulletHit',no)
        })))
    },
});
