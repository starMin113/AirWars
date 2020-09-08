// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var Common = require('wy-Common')
cc.Class({
    extends: require('FrameComponent'),

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        life : 0,
        speed:cc.Vec2,
        accelerationTime:0,
        acceleration :cc.Vec2,
        gravity :cc.Vec2,
        delay : 0,
        createDelta : 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if(this.createDelta){
            var i =0;
            for(var k in this.node.children){
                this.node.children[k].active =false;
                this.node.children[k].st = this.createDelta*i
                i++
            }
        }
        this.runTime = 0
    },

    start () {
    },

    setOptions(options){
        var speed = options.speed;
        options.speedOffset && (speed += Common.randomInteger() * options.speedOffset)
        cc.log('speed:',speed)
        if(options.r){
            var rotation = 90-options.r;
            options.ro && (rotation+=options.ro*Common.randomInteger())
            var speedx = speed*Math.cos(rotation*Math.PI/180)
            var speedy = speed*Math.sin(rotation*Math.PI/180)
    
            this.speed = cc.v2(speedx,speedy);
        } else if(options.islong){
            var play = global.GameLoop.GameMgr.getPlayer()
            if(!play){
                this.speed = cc.v2(0,speed)
            } else {

                var p1 = this.node.convertToWorldSpaceAR(cc.v2(-cc.winSize.width/2,-cc.winSize.height/2))
                var p2 = play.node.getPosition();
    
                var len = p2.sub(p1).mag()
                var a = Math.acos((p2.x - p1.x) / len)
                var r = a;
                if (p2.y < p1.y) {
                    r = 2 * Math.PI - r;
                }
                var dx = Math.cos(r) * speed
                var dy = Math.sin(r) * speed
                this.speed = cc.v2(dx, dy)
            }
        }
        else {
            this.speed = cc.v2(0,-speed)
        }
        

        options.life &&  (this.life = options.life);
        options.delay &&  (this.delay = options.delay);
        options.createDelta &&  (this.createDelta = options.createDelta);
        options.accelerationTime &&  (this.accelerationTime = options.accelerationTime);
        options.dx && (this.node.x+=options.dx)
        options.dy && (this.node.y+=options.dy)
        if(options.gravity){
            var sp = options.gravity.split(',');
            this.gravity = cc.v2(parseFloat(sp[0]),parseFloat(sp[1]));
        }
        this.createDelta = options.createDelta || 0 ;
        this.delay = 0
        if(this.createDelta){
            var i =0;
            for(var k in this.node.children){
                var chd = this.node.children[k]
                chd.active =false;
                chd.st = this.createDelta*i
                if(typeof(options.dr) != 'undefined' &&  typeof(options.drs) != 'undefined'){
                    var rotation = 90-(options.drs+options.dr*i)
                    var speedx = speed*Math.cos(rotation*Math.PI/180)
                    var speedy = speed*Math.sin(rotation*Math.PI/180)
            
                    chd.speed = cc.v2(speedx,speedy);
                }
                i++
            }
        }
    },
    updateStep(dt){
        this.runTime += dt
        for(var k in this.node.children){
            this.node.children[k].active =true;
            if(this.runTime > this.node.children[k].st){
                this.node.children[k].active = true;
            }
        }
        if(this.delay > 0){
            this.delay -= dt
            return;
        }
        if(this.life < 0){
            this.node.destroy();
            return;
        }
        // this.node.x += this.speed.x*dt
        // this.node.y += this.speed.y*dt

        this.life -= dt;
        this.accelerationTime -= dt; 
        // this.runTime += dt;
        if(this.life < 0){
            this.node.destroy();
            // this.recovery();
        } else if(this.speed){
            var ax = Math.max(this.accelerationTime,0) * this.acceleration.x
            var ay = Math.max(this.accelerationTime,0) * this.acceleration.y
            var gx = this.gravity.x * this.runTime * this.runTime / 2
            var gy = this.gravity.y * this.runTime * this.runTime / 2
            var x = (this.speed.x+ax) * dt+gx;
            var y = (this.speed.y+ay) * dt+gy;
            // this.node.x += x
            // this.node.y += y

            for(var k in this.node.children){
                this.node.children[k].x +=x
                this.node.children[k].y +=y
            }
        } else {
            
            // this.node.x += x
            // this.node.y += y

            for(var k in this.node.children){
                var chd = this.node.children[k];

                var ax = Math.max(this.accelerationTime,0) * this.acceleration.x
                var ay = Math.max(this.accelerationTime,0) * this.acceleration.y
                var gx = this.gravity.x * this.runTime * this.runTime / 2
                var gy = this.gravity.y * this.runTime * this.runTime / 2
                var x = (chd.speed.x+ax) * dt+gx;
                var y = (chd.speed.y+ay) * dt+gy;
                chd.x += x;
                chd.y +=y;
            }
        }
    },
    update (dt) {
        if(cc.isPauseGame){
            return;
        }
        this.autoUpdate && this.updateStep(dt)  
    },
    gameUpdate(dt){
        this.updateStep(dt)  
    }
});
