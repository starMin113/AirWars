var Common =require('wy-Common')
cc.Class({
    extends: cc.Component,

    // 起始点位置偏移
    // 起始点大小偏移
    // 起始点方向
    // 起始点透明度

    // life 存在生命
    // lifeRound 生命偏移
    // EmissionRate 每秒发射数量
    // scale 大小变化
    // opacity 透明度变化
    
    // 结束点位置偏移
    // 结束点大小偏移
    // 结束点方向
    // 结束点透明度

    properties: {
        target : {
            default:null,
            type:cc.Asset,
            tooltip : '初始化值用',
            notify:function(r){
                this.switchStatusChanged(r)
            }
        },
        spriteFrame : "",
        life : {
            default : 0,
            tooltip : '生命时间',
            serializable:true
        },
        lifeOffset : {
            default : 0,
            tooltip : '生命偏移'
        },
        emissionRate : {
            default : 0,
            tooltip : '每秒发射数量'
        },
        startPointOffset : {
            default : cc.v2(0,0),
            tooltip : '起始点位置偏移'
        },
        speed : {
            default : 0,
            type : 0,
            tooltip : '移动速度，单位秒'
        },
        accelerationStart:{
            default :0,
            type : cc.Integer,
            tooltip:'加速度的初始速度'
        },
        accelerationTime:{
            default :0,
            type : cc.Float,
            tooltip:'加速度的变化时间，将加速度变为0的时间'
        },
        gravity:{
            default : cc.v2(0,0),
            tooltip : '重力值'
        },
        speedOffset : {
            default : 0,
            type : 0,
            tooltip : '移动变化偏移'
        },
        startSizeOffset:{
            default : cc.v2(0,0),
            tooltip : '初始大小偏移'
        },
        startAngle:{
            default : 0,
            tooltip : '初始方向'
        },
        startAngleOffset:{
            default : 0,
            tooltip : '初始方向偏移'
        },
        startOpacity :{
            default : 255,
            tooltip : '初始透明度'
        },
        startOpacityOffset:{
            default : 0,
            tooltip : '初始透明度偏移'
        },
        opacityRate:{
            default : 0,
            tooltip : '透明度变化'
        },
        opacityRateOffset:{
            default : 0,
            tooltip : '透明度变化偏移'
        },
        startScale:{
            default : cc.v2(1,1),
            tooltip : '初始缩放'
        },
        startScaleOffset:{
            default : cc.v2(0,0),
            tooltip : '初始缩放偏移'
        },
        scaleRate :{
            default : cc.v2(0,0),
            tooltip : '缩放变化'
        },
        scaleRateOffset :{
            default : cc.v2(0,0),        
            tooltip : '缩放变化偏移'
        },
        repeat : {
            default:-1,
            type : cc.Integer,
            tooltip : '循环次数,-1表示无限'
        }
    },

    switchStatusChanged(r){
        cc.log('switchStatusChanged:',this.target.text)

        var data = Common.readJson(this.target)
        var keys = Object.keys(data);
        var d= {};
        for(var k in keys){
            var key = keys[k];
            var t = data[key];
            if(t){
                if(Object.keys(t).length>0){
                    d[key] = cc.v2(t.x,t.y);
                } else {
                    d[key] = t;
                }
            }
        }
        d.spriteFrame = data.spriteFrame
        Object.assign(this,d);

            // this.life=3;
        // var self = this;
        // var fs = require('fs')
        // fs.readFile(this.target,'utf8',function(err,fd){
        //     cc.log('fd:',fd)
        //     var data = JSON.parse(fd);
        //     var keys = Object.keys(data);
        //     var d= {};
        //     for(var k in keys){
        //         var key = keys[k];
        //         var t = data[key];
        //         if(t){
        //             if(Object.keys(t).length>0){
        //                 d[key] = cc.v2(t.x,t.y);
        //             } else {
        //                 d[key] = t;
        //             }
        //         }
        //     }
        //     d.spriteFrame = data.spriteFrame
        //     cc.log('res:',d)
        //     Object.assign(self,d);
            
        // })
        
    },
    getData(){
        return {
            life:this.life,
            lifeOffset:this.lifeOffset,
            emissionRate:this.emissionRate,
            speed:this.speed,
            speedOffset:this.speedOffset,
            startPointOffset: this.startPointOffset,
            startSizeOffset:this.startSizeOffset,
            startAngle:this.startAngle,
            startAngleOffset:this.startAngleOffset,
            startOpacity:this.startOpacity,
            startOpacityOffset:this.startOpacityOffset,
            opacityRate:this.opacityRate,
            opacityRateOffset:this.opacityRateOffset,
            startScale:this.startScale,
            startScaleOffset:this.startScaleOffset,
            scaleRate:this.scaleRate,
            scaleRateOffset:this.scaleRateOffset,
            repeat:this.repeat,
            spriteFrame : this.spriteFrame,
            accelerationStart:this.accelerationStart,
            accelerationTime:this.accelerationTime,
            gravity:this.gravity
        }
    }
});
