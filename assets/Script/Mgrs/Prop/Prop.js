
cc.Class({
    extends: require('BaseUnit'),

    properties: {
        frames : [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.itemBg = this.node.getChildByName('item_bg')
        // this.itemBg.runAction(cc.repeatForever(cc.rotateBy(3,-360)));
        this.itemBg1 = this.node.getChildByName('item_bg1')
        // this.itemBg1.runAction(cc.repeatForever(cc.rotateBy(5,360)));
        this.icon = this.node.getChildByName('icon').getComponent(cc.Sprite)
    },
    onColliderEnter(no){
        // cc.log('onColliderEnter 道具')
        if(no.onGetProp && no.onGetProp(this)){
            // this._destroyImmediate();
            this.node.destroy();
            return true;
        }
        return false;
    },


    setType(type){
        this.type = type;
        this.icon.spriteFrame = this.frames[type];
    },
    gameUpdate(dt){
        this.itemBg1.rotation = (this.itemBg1.rotation-360/5*dt)%360
        this.itemBg.rotation = (this.itemBg.rotation+360/3*dt+360)%360
    }
});
