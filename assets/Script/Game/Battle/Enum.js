module.exports = {
    CAMP : cc.Enum({
        neutral : 0, //中立
        friend : 1, //友方
        enemy : 2 //敌方 
    }),
    BulletType : cc.Enum({
        normal : 0, //击中完就消失
        single : 1, //穿透子弹
        continue : 2 //间断伤害
    })
}