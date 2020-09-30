var Enum = require('Enum')

cc.Class({
    extends: cc.Component,

    properties: {
        camp : {
            default :Enum.CAMP.neutral,
            type : Enum.CAMP,
            tooltip : 'neutral中立\nfriend友方\nenemy敌方'
        },
        type : { //伤害类型
            default:Enum.BulletType.normal,
            type : Enum.BulletType,
            tooltip : '0是普通，打一次消失\n1是击穿对一只怪只伤害一次，\n是延时对一只怪可多次伤害，有时间间隔'
        }
    },
    onEnable(){
        global.GameLoop.GameMgr && global.GameLoop.GameMgr.colliderMgr.addBullet(this);
    },
    onDisable(){
        global.GameLoop.GameMgr && global.GameLoop.GameMgr.colliderMgr.removeBullet(this);
    },
    setType(t){
        if(t == undefined){
            cc.warn('无效的类型')
            return;
        }
        this.type =t ;
    },

    setCamp(camp){
        if(camp == undefined){
            cc.warn('无效的阵容')
            return;
        }
        this.camp = camp;
    }
});
