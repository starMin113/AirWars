var Common = require('wy-Common')
var ParticleSystem = require('ParticleSystem')
var ParticlePool = require('ParticlePool')
cc.Class({
    extends: cc.Component,

    properties: {
        coinSf :cc.SpriteFrame
    },

    onLoad(){
    },

    createCoin(coin,monster){
        var point = monster.node.getPosition();
        var idx = 0;
        var arr = [];
        while(coin > 0){
            if(coin > 500){
                arr.push(500)
                // this.addLauncher('coin50',{coin:50},idx*30,point);
                coin-=500;
            } else if(coin >= 100){
                arr.push(100)
                // this.addLauncher('coin50',{coin:10},idx*30,point);
                coin-=100
            } else {
                var c = Common.clamp(0,50,coin);
                arr.push(c)
                coin-=c;
            }
            idx++;
        }
        for(var i=0; i<arr.length; i++){
            this.addLauncher(arr.length,arr[i],point);
        }
    },
    addLauncher(len,v,point){
        var end = cc.moveTo(0.3+Math.random()*0.3,cc.v2(-330,cc.winSize.height/2-130));
        let node = ParticlePool.get('coin50',global.GameLoop.GameMgr.s_gameUI.node,'coin50',this.coinSf,{});
        // node._coin = v;
        node.scale = 0.3
        node.setPosition(point)
        var arr = [];
        if(len == 1){
            arr.push(cc.delayTime(0.2));
        } else {
            arr.push(cc.moveBy(0.3,cc.v2(Math.random() * 300-150,Math.random() * 300-150)).easing(cc.easeBackOut()));
        }
        arr.push(end.easing(cc.easeSineIn()));
        arr.push(cc.callFunc(function(){
            global.GameLoop.GameMgr.sound.playCoin();
            global.GameLoop.GameMgr.addCoin(v);
            ParticlePool.put('coin50',node)
        }))
        node.runAction(cc.sequence(arr));

        // node.runAction(cc.sequence(cc.moveBy(0.4,cc.v2(Math.random() * 300-150,Math.random() * 300-150)).easing(cc.easeBackOut()),end.easing(cc.easeSineIn()),cc.callFunc(function(){
        //     global.GameLoop.GameMgr.sound.playCoin();
        //     global.GameLoop.GameMgr.addCoin(v);
        //     ParticlePool.put('coin50',node)
        // })));
            // sprite.node.runAction(cc.moveBy(0.5,cc.v2(Math.random() * 150-75,Math.random() * 150-75)).easing(cc.easeBackOut()));
        // }
    },
    gameUpdate(dt){
        // var friends = global.GameLoop.GameMgr.colliderMgr.getGroup(global.Enum.CAMP.friend)
        // var player = global.GameLoop.GameMgr.getPlayer()
        // if(!player){
        //     return;
        // }
        // var playerNode = player.node;
        // for(var i=0; i<this.node.children.length; i++){
        //     var child = this.node.children[i];
        //     var ps = child.getComponent('ParticleSprite');
        //     if(!ps){
        //         continue;
        //     }
        //     if(Math.abs(child.x-playerNode.x) < 300 && Math.abs(child.y-playerNode.y) < 300){
        //         var p1 = child.getPosition();
        //         var p2 = playerNode.getPosition();
        //         var len =30
        //         var a = global.Common.getAngle(p1,p2);
        //         var ca = Math.cos(a), sa = Math.sin(a);
        //         var dx = ca*len*(p2.x>p1.x?1:-1)+p1.x;
        //         var dy = sa*len*(p2.y>p1.y?1:-1)+p1.y;
        //         child.x = dx;
        //         child.y = dy;
        //         ps.enabled = false;
        //         if(Math.abs(child.x-playerNode.x) < 20 && Math.abs(child.y-playerNode.y) < 20){
        //             if(ps._coin){
        //                 global.GameLoop.GameMgr.addCoin(ps._coin);
        //             }
                    
        //             ps.recovery();
        //         }
        //     } else {
        //         ps.enabled = true;
        //     }
        // }
    }
});
