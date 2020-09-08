cc.Class({
    extends: cc.Component,
    properties: {
        config : cc.RawAsset,
        resJson : cc.RawAsset
    },
    startGame() {
        // function joinGame() {
        //     var door = cc.find('Canvas/door');
        //     door.active = true;
        //     door.js.moveIn(() => {
        //         global.Loader.loadResources('GameLoop', function (err, res) {
        //             global.GameLoop.enterGameScene();
        //         })
        //     });
        // }
        // joinGame();

        global.Loader.loadResources('GameLoop', function (err, res) {
            cc.log("enter game scene");
            //global.GameLoop.enterGameScene();
        })
    },

    onLoad() {
        if (window.global == null) {
            window.global = {}
        }
        global.Loader = require('wy-Loader');
        global.Loader.init();
        this.initResList();
    },

    initResList() {
        cc.loader.load(this.resJson, function (err, res) {
            if(err){
                cc.error(err);
            }else{
                global.Resources = res.json;
                this.startGame();
            }
          
        }.bind(this));
    }

});