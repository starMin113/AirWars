var Enum = require('Enum')
var ColliderManager = require('ColliderManager')

cc.Class({
    extends: cc.Component,

    properties: {
        camp : {
            default :Enum.CAMP.neutral,
            type : Enum.CAMP,
            tooltip : 'neutral中立\nfriend友方\nenemy敌方'
        },
        blood :{
            default : 0,
            type : cc.Integer,
            visible : false
        }
    },
    onEnable(){
        global.GameLoop.GameMgr.colliderMgr.addUnit(this);
    },
    onDisable(){
        global.GameLoop.GameMgr.colliderMgr.removeUnit(this);
    },
    setCamp(camp){
        if(camp == undefined){
            cc.warn('无效的阵容')
            return;
        }
        this.camp = camp;
    }
});
