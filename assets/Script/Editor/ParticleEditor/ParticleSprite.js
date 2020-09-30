var Common = require('wy-Common')
var ParticlePool = require('ParticlePool')
var FrameManager = require('FrameManager')
cc.Class({
    extends: require('FrameComponent'),

    properties: {
    },
    onLoad(){
    },
    setCallBack(cb){
        if(!cb){
            // cc.log('')
        }
        this.cb = cb
    },
    initData(particleData){
        // this.node._particle = particleData
        this.runTime = 0;
    },

    recovery(){
        // cc.log('recovery')
        var bullet = this.node.getComponent('Bullet');
        bullet&&bullet._destroyImmediate();
        ParticlePool.put(this.node._particle.poolName,this.node)
        this.cb&&this.cb(this);
        this.cb = null;
    },
    updateStep(dt){
        if(!this.enabled){
            return;
        }
        this.node._particle.life -= dt;
        this.node._particle.accelerationTime -= dt; 
        this.runTime += dt;
        if(this.node._particle.life < 0){
            this.recovery();
        } else {
            var ax = Math.max(this.node._particle.accelerationTime,0) * this.node._particle.acceleration.x
            var ay = Math.max(this.node._particle.accelerationTime,0) * this.node._particle.acceleration.y
            var gx = this.node._particle.gravity.x * this.runTime * this.runTime / 2
            var gy = this.node._particle.gravity.y * this.runTime * this.runTime / 2
            var x = (this.node._particle.speed.x+ax) * dt+gx;
            var y = (this.node._particle.speed.y+ay) * dt+gy;
            this.node.x += x
            this.node.y += y

            this.node.opacity = Common.clamp(0,255,this.node.opacity+this.node._particle.opacity*dt);
            this.node.setScale(this.node.scaleX+this.node._particle.scale.x*dt,this.node.scaleY+this.node._particle.scale.y*dt)
        }
    },

    update(dt){
        if(!this.autoUpdate){
            return;
        }
        if(!this.node._particle){
            return
        }
        this.updateStep(dt);
        
    },
    gameUpdate(dt){
        if(!this.node._particle){
            return
        }
        this.updateStep(dt);
    }
});
