
cc.Class({
    extends: cc.Component,

    properties: {
        launcher : [require('SkillLauncher')]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // for(var i=0; i<this.launcher.length; i++){
        //     this.launcher[i].node.runAction(cc.sequence(cc.rotateBy(2,-180),cc.rotateBy(2,180)));
        // }
    },

    // update (dt) {},
});
