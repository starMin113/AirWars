//碰撞管理
cc.Class({
    extends: cc.Component,

    properties: {
        debugDraw : true,
        graphics : cc.Graphics
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.friendGroup = [];
        this.neutralGroup = [];
        this.enemyGroup = [];
        
        this.a_friendBulletGroup = [];
        this.a_neutralBulletGroup = [];
        this.a_enemyBulletGroup = [];
        if(this.debugDraw && !this.graphics){
            cc.warn('没有绘制组件')
            this.debugDraw = false;
            this.graphics.node.active = true;
        } else if(!this.debugDraw && this.graphics){
            this.graphics.node.active = false;
        }
    },

    addUnit(script){
        if(script.camp == undefined || script.camp == null){
            return cc.error('没有阵容，无法添加')
        }
        if(script.camp == global.Enum.CAMP.neutral){
            this.neutralGroup.push(script);
        } else if(script.camp == global.Enum.CAMP.friend){
            this.friendGroup.push(script);
        }else if(script.camp == global.Enum.CAMP.enemy){
            this.enemyGroup.push(script);
        }
    },
    removeArrayChild(arr,child){
        var i =0;
        while(i<arr.length){
            if(arr[i] == child){
                arr.splice(i,1);
            } else {
                i++
            }
        }
    },

    removeUnit(script){
        if(script.camp == global.Enum.CAMP.neutral){
            this.removeArrayChild(this.neutralGroup,script)
        } else if(script.camp == global.Enum.CAMP.friend){
            this.removeArrayChild(this.friendGroup,script)
        }else if(script.camp == global.Enum.CAMP.enemy){
            this.removeArrayChild(this.enemyGroup,script)
        }
    },

    addBullet(script){
        if(!script.camp){
            return cc.error('没有阵容，无法添加')
        }
        this.removeUnit(script);
        if(script.camp == global.Enum.CAMP.neutral){
            this.a_neutralBulletGroup.push(script);
        } else if(script.camp == global.Enum.CAMP.friend){
            this.a_friendBulletGroup.push(script);
        }else if(script.camp == global.Enum.CAMP.enemy){
            this.a_enemyBulletGroup.push(script);
        }
    },
    removeBullet(script){
        if(script.camp == global.Enum.CAMP.neutral){
            this.removeArrayChild(this.a_neutralBulletGroup,script)
        } else if(script.camp == global.Enum.CAMP.friend){
            this.removeArrayChild(this.a_friendBulletGroup,script)
        }else if(script.camp == global.Enum.CAMP.enemy){
            this.removeArrayChild(this.a_enemyBulletGroup,script)
        }
    },

    getGroup(camp){
        if(camp == global.Enum.CAMP.neutral){
            return this.neutralGroup
        }else if(camp == global.Enum.CAMP.friend){
            return this.friendGroup
        }else if(camp == global.Enum.CAMP.enemy){
            return this.enemyGroup
        } else {
            console.error('获取的对象的group为空:',camp)
            return null;
        }
    },

    getBullet(camp){
        if(camp == global.Enum.CAMP.neutral){
            return this.a_neutralBulletGroup
        }else if(camp == global.Enum.CAMP.friend){
            return this.a_friendBulletGroup
        }else if(camp == global.Enum.CAMP.enemy){
            return this.a_enemyBulletGroup
        } else {
            console.error('获取的子弹的group为空:',camp)
            return null;
        }
    },

    getBoundingBoxToWorld(_js){
        var no = _js.node
        var bulletRect;
        if(_js.rect){ //如果有指定的大小，则不定
            var start = no.convertToWorldSpaceAR(cc.v2(no.width*no.anchorX,no.height*no.anchorY))
            var rect = _js.rect
            bulletRect = cc.rect(start.x-cc.winSize.width/2+rect.x,start.y-cc.winSize.height/2+rect.y,rect.width,rect.height)
        } else {
            var start = no.convertToWorldSpaceAR(cc.v2(no.width*no.anchorX,no.height*no.anchorY))
            bulletRect = cc.rect(start.x-cc.winSize.width/2-no.width*no.anchorX,start.y-cc.winSize.height/2-no.width*no.anchorY,no.width,no.height)
        }
        return bulletRect
    },

   /* checkBulletCollider(bullets,group,ignore=true,scale=1){ //ignore为true的话，需要判断是否无敌，如果是拾取东西的话，不需要判断无敌
        for(var i=0; i<bullets.length; i++){
            var bullet = bullets[i].node;
            // var center = global.GameLoop.GameMgr.no_BulletLayer.convertToWorldSpaceAR(cc.v2())
            var bulletRect;
            var start = global.GameLoop.GameMgr.no_BulletLayer.convertToWorldSpaceAR(cc.v2(bullet.x-bullet.width*scale*(1-bullet.anchorX),bullet.y-bullet.height*scale*(1-bullet.anchorY)))
            var b1 = cc.rect(start.x,start.y,bullet.width*scale,bullet.height*scale)
            if(bullets[i].rect){ //如果有指定的大小，则不定
                var start = global.GameLoop.GameMgr.no_BulletLayer.convertToWorldSpaceAR(cc.v2(bullet.x,bullet.y))
                var rect = bullets[i].rect
                bulletRect = cc.rect(start.x+rect.x,start.y+rect.y,rect.width,rect.height)
            } else {
                var start = global.GameLoop.GameMgr.no_BulletLayer.convertToWorldSpaceAR(cc.v2(bullet.x-bullet.width*scale*(1-bullet.anchorX),bullet.y-bullet.height*scale*(1-bullet.anchorY)))
                bulletRect = cc.rect(start.x,start.y,bullet.width*scale,bullet.height*scale)
            }
            for(var j=0; j<group.length; j++){
                var no = group[j].node
                if(ignore&&group[j].isIgnore){
                    continue;
                }
                var arc = no.anchorX
                var s1 = global.GameLoop.GameMgr.no_BulletLayer.convertToWorldSpaceAR(cc.v2(no.x-no.width*scale*(1-no.anchorX),no.y-no.height*scale**(1-no.anchorY)))
                var other = cc.rect(s1.x,s1.y,no.width*scale,no.height*scale)
                if(bulletRect.intersects(other)){
                    var c = bullets[i].onColliderEnter(group[j]) //碰撞后只通知子弹，由子弹来检测碰撞
                    if(c){
                        break;
                    }
                }

            }
        }
    },*/
    checkBulletCollider1(bullets,group,ignore=true){
        for(var i=0; i<bullets.length; i++){
            if(!bullets[i]){
                cc.warn('not found onColliderEnter',bullets[i].node.name)
            }
            let bulletRect = this.getBoundingBoxToWorld(bullets[i]);
            for(var j=0; j<group.length; j++){
                if(ignore&&group[j].isIgnore){
                    continue;
                }
                let other = this.getBoundingBoxToWorld(group[j]);
                if(bulletRect.intersects(other)){
                    if(!bullets[i].onColliderEnter){
                        cc.warn('not found onColliderEnter',bullets[i].node.name)
                    }
                    var c = bullets[i].onColliderEnter(group[j]) //碰撞后只通知子弹，由子弹来检测碰撞
                    if(c){
                        break;
                    }
                }
            }
        }
    },

    lateGameUpdate(dt){
        this.checkBulletCollider1(this.a_friendBulletGroup,this.enemyGroup);
        this.checkBulletCollider1(this.neutralGroup,this.friendGroup,false);
        this.checkBulletCollider1(this.a_enemyBulletGroup,this.friendGroup,true,0.5);
        this.checkBulletCollider1(this.enemyGroup,this.friendGroup,true,0.5);
        if(!this.debugDraw){
            return;
        }
        this.graphics.clear();
        this.graphics.strokeColor = cc.color(0,255,0,255);
        this.graphics.lineWidth = 2;
        this.drawRect(this.friendGroup);
        this.drawRect(this.a_friendBulletGroup);
        
        this.drawRect(this.enemyGroup);
        this.drawRect(this.a_enemyBulletGroup,0.5);

        this.drawRect(this.neutralGroup);
        this.graphics.stroke();
    },
    drawRect(arr,scale=1){
        for(var i=0; i<arr.length; i++){
            var bulletRect = this.getBoundingBoxToWorld(arr[i])
            this.graphics.rect(bulletRect.xMin,bulletRect.yMin,bulletRect.size.width,bulletRect.size.height);
        }
    },
    gameUpdate(dt){
       /* if(!this.debugDraw){
            return;
        }
        this.graphics.clear();
        this.graphics.strokeColor = cc.color(0,255,0,255);
        this.graphics.lineWidth = 2;
        // this.drawRect(this.friendGroup);
        this.drawRect(this.a_friendBulletGroup);
        
        this.drawRect(this.enemyGroup);
        this.drawRect(this.a_enemyBulletGroup,0.5);

        // this.drawRect(this.neutralGroup);
        this.graphics.stroke();*/
    }
});
