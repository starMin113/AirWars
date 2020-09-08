
var Common = require('wy-Common')
var ParticlePool = require('ParticlePool')
var Event = {
    CREATE:'particle_create', //创建粒子
    DESTROY :'particle_destroy',//粒子销毁
    REPEAT : 'particle_repeat',//重复次数
    FINISH : 'particle_finish', //发射完成，不再发射
    ALL_FINISH : 'finish'//运行完成 如果repeat==-1，无法运行完成
}

var ParticleMore = cc.Class({
    name : 'ParticleMore',
    properties:{
        dx : 0,
        dy : 0,
        dr : 0,
    },
})

var ParticleMoreZero = new ParticleMore();
ParticleMoreZero.dx =0 ;
ParticleMoreZero.dy =0 ;
ParticleMoreZero.dr =0 ;


cc.Class({
    extends: require('FrameComponent'),

    properties: {
        asset : cc.TextAsset,
        texture : {
            default:null,
            type :cc.SpriteFrame,
            tooltip:'使用assets加载，会优先使用配置中的图片，如果没有再使用本设置的图片'
        },
        lift : {
            default : 1,
            visible : false
        },
        useEditor : {
            default :false,
            tooltip : '勾选用使用编辑器数据，否则使用资源配置',
            notify:function(r){
                this._updateState(r);
            }
        },
        autoPlay : false,
        launchData : {
            type :ParticleMore,
            default :[]
        }
    },
    statics:{
        Event :Event
    },
    _updateState(r){
        // cc.log('',r)
        if(!r){
            if(!this.node.getComponent('ParticleSystemEditor')){
                this.node.addComponent(require('ParticleSystemEditor'))
            }
        } else {
            this.node.removeComponent('ParticleSystemEditor')
        }
    },
    addEvent(type,func){
        this.events[type] = func;
    },
    dispatch(type,data){
        this.events[type] && this.events[type](data);
    },
    setParticleLayer(l){
        this.parentNode = l
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.events = {};
        // cc.log('asset:',this.asset);
        this.particleTexture = null;
        this.isPause = false;
        this.parentNode = this.node

        var self = this;
        if(this.asset){

            this.loadData(Common.readJson(this.asset),this.autoPlay)
            // cc.loader.load(this.asset,function(err,res){
            //     // cc.log('res:',res);
            //     res = JSON.parse(res);
            //     self.loadData(res,self.autoPlay)
            // })
        } else {
            var editor = this.node.getComponent('ParticleSystemEditor');
            if(editor){
                var poolName = this.node.name
                this.data = editor.getData();
                if(this.data.spriteFrame.length > 0){
                    cc.loader.loadRes(this.data.spriteFrame,cc.SpriteFrame, function(err,r){
                        if(r){
                            self.setTextureStart(r,true,poolName);
                        } else if(self.texture){
                            console.log('资源丢失:',res.spriteFrame,'使用编辑器资源')
                            self.setTextureStart(self.texture,true,poolName);
                        } else {
                            console.error('资源丢失:',res.spriteFrame,'无法运行')
                        }
                    })
                } else if(self.texture){
                    console.log('资源丢失:','使用编辑器资源')
                    self.setTextureStart(self.texture,true,poolName);
                } else {
                    console.error('资源丢失:',res.spriteFrame,'无法运行')
                }
            }
        }
    },

    loadData(data,auto=true){
        var self = this;
        this.data = data
        cc.loader.loadRes(data.spriteFrame,cc.SpriteFrame,function(er,r){
            if(r){
                self.setTextureStart(r,auto,data.poolName);
            } else if(self.texture){
                console.log('资源丢失:',res.spriteFrame,'使用编辑器资源')
                self.setTextureStart(self.texture);
            } else {
                console.error('资源丢失:',res.spriteFrame,'无法运行')
            }
        })
    },

    setTextureStart(texture,autoPlay,poolName='poolName'){
        this._poolName = poolName
        this.particleTexture = texture;
        // this.initPool(this.particleTexture,poolName);
        if(autoPlay && this.node){
            this.startLaunch();
        }
        // 
    },

    setLauncherData(data){
        this.launchData = data;
    },

    startLaunch(){
        this.lastTime = 0;
        this.isRuning = true
        this.isLaunch = true;
        this.repeat = 0;
        
        
        this.resetCreateTime();
        this.index = -1;
        // cc.log('startLaunch')
        // this.index = 0;
        this.runTime = 0
        var arrs = [];
        if(!this.launchData){
            this.launchData = [{dx:0,dy:0,dr:0}]
        }
    },

    stopLauncher(){
        this.isLaunch = false
    },

    onDestroy(){
        this._super()
        clearInterval(this._particleInterval)
        // var children = this.parentNode.children
        // if(children){
        //     for(var i=0; i<children.length; i++){
        //         if(children[i].isValid){
        //             var ps = children[i].getComponent('ParticleSprite')
        //             ps&&ps.setCallBack&&ps.setCallBack(null);
        //         }
        //     }
        // }
        
    },

    resetNode(){
        for(var i=0; i<this._pools._pool.length; i++){
            var no =  this._pools._pool[i];
            delete no._isGet;
        }
    },

    resetCreateTime(){
        this.createTimes = [];
        var max = 1000/this.data.emissionRate;
        for(var i=0; i<this.data.emissionRate; i++){
            this.createTimes[i] = (i)/(this.data.emissionRate)
        }
        this._createTimes = 1.0/this.data.emissionRate
        // var dlt = 1/this.data.emissionRate
        // var self = this;
        // this.schedule(function(){
        //     this.launch();
            
        // },dlt)
    },

    randomInteger(){
        return Math.random() * 2 -1
        // return Math.random()* (Math.random() < 0.5 ? -1 : 1);
    },

    launch(delta){
        if(!this.particleTexture){
            global.ErrorLog.upload('ParticleSystemTextureNull:'+data.spriteFrame,"发射粒子时所依赖的纹理文件不存在")
        }
        let node = ParticlePool.get(this._poolName,this.parentNode,'particle'+this.index,this.particleTexture,this.node._skillBase)
        // if(!this.base1){
            var pbase = this.node.convertToWorldSpaceAR(cc.v2(0,0));  
            this.base1 = this.parentNode.convertToNodeSpaceAR(pbase);
        // }
        node.x = delta.dx+this.base1.x+this.parentNode.x +this.data.startPointOffset.x * this.randomInteger();
        node.y = delta.dy+this.base1.y+this.parentNode.y + this.data.startPointOffset.y* this.randomInteger();

        
        var initAngle = delta.dr+this.data.startAngle+this.node.angle
        var speed = this.data.speed+this.data.speedOffset * this.randomInteger()
        var angle = Math.PI/2-initAngle-this.data.startAngleOffset*this.randomInteger()
        var speedx = speed*Math.cos(angle)
        var speedy = speed*Math.sin(angle)
        node.angle = angle
        if(!node._particle){
            node.opacity = this.data.startOpacity +this.data.startOpacityOffset * this.randomInteger()
            var scalex = this.data.startScale.y + this.data.startScaleOffset.x * this.randomInteger()
            var scaley = this.data.startScale.y + this.data.startScaleOffset.y * this.randomInteger()
            node.setScale(scalex,scaley);

            var acceleration = (this.data.accelerationStart || 0 )
            var accelerationTime = (this.data.accelerationTime || 0)
            node._particle = {
                poolName : this._poolName,
                speedInit:speed,
                speed : cc.v2(speedx,speedy),
                acceleration : cc.v2(acceleration*Math.cos(angle*Math.PI/180),acceleration*Math.sin(angle*Math.PI/180)),
                accelerationTime :accelerationTime,
                gravity : this.data.gravity || cc.v2(0,0),
                life : this.data.life + this.data.lifeOffset * this.randomInteger(),
                angle : this.data.startAngle + this.data.startAngleOffset * this.randomInteger(),
                index : this.index,
                opacity : this.data.opacityRate+this.data.opacityRateOffset*this.randomInteger(),
                scale : cc.v2(this.data.scaleRate.x+this.data.scaleRateOffset.x*this.randomInteger(),this.data.scaleRate.y+this.data.scaleRateOffset.y*this.randomInteger()),
                createTime : this.runTime
            }
        } else {
            node._particle.speed = cc.v2(speedx,speedy)
            node._particle.life = this.data.life + this.data.lifeOffset * this.randomInteger()
            // cc.log('')
        }
        node.sprite.initData();
        var self = this;
        node.sprite.setCallBack(function(sf){
            if(self.node){
                self.dispatch(Event.DESTROY,{detail:sf,target:self});
                if(self.parentNode.children.length == 0){
                    self.dispatch(Event.ALL_FINISH,{target:self});
                }
            }
        })
        this.dispatch(Event.CREATE,{target:self,detail:node.sprite});
    },
    updateStep(dt){
        this.runTime += dt
        if(this.runTime > this._createTimes){
            for(var m=0; m<this.launchData.length; m++){
                var l = this.launchData[m];
                this.launch(l);
            }
            this.index++;
            this.runTime = 0;
            if(this.isLaunch && this.index >= this.data.emissionRate-1){
                if(this.data.repeat != -1){
                    this.repeat++;
                }

                if(this.data.repeat == -1 || this.repeat < this.data.repeat){
                    this.dispatch(Event.repeat,this);
                    this.resetCreateTime();
                    this.runTime = 0;
                    
                    this.index = -1;
                } else {
                    this.dispatch(Event.FINISH,{target:this});
                    this.isLaunch = false;
                }
            }
        }
    },
    update(dt){
        if(!this.isRuning || !this.isLaunch){
            return
        }
        this.autoUpdate && this.updateStep(dt)
    },
    gameUpdate(dt){
        if(!this.isRuning || !this.isLaunch){
            return
        }
        this.updateStep(dt)
    }
});
