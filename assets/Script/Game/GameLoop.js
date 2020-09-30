
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.b_gameResIsLoad = false;
    },

    enterGameScene(){
        this._loadGameScene();
    },

    _loadGameScene(){
        
        this.b_gameResIsLoad = false;
        var self =this;
        var game = global.Loader.getInstantiate('game/Game');
        this.node.addChild(game);
        this.GameMgr = game.getComponent('GameManager');
        // this.GameMgr.preloadScene(global.gates,function(){//global.gates
                
        // },function(){
        //     cc.log('加载完成')
        // });
    },
    // update (dt) {},
});
