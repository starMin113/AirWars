
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    createProp(type,point,tupo){
        if(!tupo){
            var max = 0;
            for(var i=0; i<this.node.children.length; i++){
                var chid = this.node.children[i];
                if(chid.getComponent('Prop').type == type){
                    max++;
                }
            }
            if(max >=2){
                return;
            }
        }
        
        var node = global.Loader.getInstantiate('game/prop');
        this.node.addChild(node);
        node.setPosition(point);
        node.getComponent('Prop').setType(type);
        this.randomRotation(node);
    },
    randomRotation(no){
        var ro = Math.floor(Math.random()*360);
        no._moveRotation = ro * Math.PI / 180;
    },

    gameUpdate(dt){
        for(var i=0; i<this.node.children.length; i++){
            var chid = this.node.children[i];
            chid.getComponent('Prop').gameUpdate(dt);
            chid.x+=(Math.sin(chid._moveRotation)*200*dt);
            chid.y+=(Math.cos(chid._moveRotation)*200*dt);
            var no = Math.random() * 180;
            if(chid.x < -this.node.width/2+50){ //最左边
                no +=0;
            } else if(chid.x > this.node.width/2-50){ //最右边
                no += 180;
            } else if(chid.y < -this.node.height/2+50){ //最下边
                no -= 90;
            } else if(chid.y > this.node.height/2-50){ //最上边
                no += 90;
            } else {
                continue
            }
            chid._moveRotation = no * Math.PI / 180;
        }


        var player = global.GameLoop.GameMgr.getPlayer()
        if(!player){
            return;
        }
        var playerNode = player.node;
        for(var i=0; i<this.node.children.length; i++){
            var child = this.node.children[i];
            var ps = child
            // if(!ps){
            //     continue;
            // }
            if(Math.abs(child.x-playerNode.x) < 300 && Math.abs(child.y-playerNode.y) < 300){
                var p1 = child.getPosition();
                var p2 = playerNode.getPosition();
                var len =30
                var a = global.Common.getAngle(p1,p2);
                var ca = Math.cos(a), sa = Math.sin(a);
                var dx = ca*len*(p2.x>p1.x?1:-1)+p1.x;
                var dy = sa*len*(p2.y>p1.y?1:-1)+p1.y;
                child.x = dx;
                child.y = dy;
                // ps.ac = false;
                if(Math.abs(child.x-playerNode.x) < 20 && Math.abs(child.y-playerNode.y) < 20){
                    if(ps._coin){
                        global.GameLoop.GameMgr.addCoin(ps._coin);
                    }
                    
                    if(ps.cb){
                        ps.cb(ps)
                    } else {
                        child.destroy();
                    }
                }
            } else {
                // ps.enabled = true;
            }
        }
    }


    // update (dt) {},
});
