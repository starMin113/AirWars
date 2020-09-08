
cc.Class({
    extends: require('BaseBullet'),

    properties: {
    },
    onLoad(){
        this.attackMonster = [];
        this.mainLevelData = 0;
        this.supLevelData = 0
        if(global.Data && global.Data.mainArmsLevel){
            this.mainLevelData = global.Data.mainArmsLevel
        }
        if(global.Data && global.Data.childArmsLevel){
            this.supLevelData = global.Data.childArmsLevel
        }
        this.life = 0;
        
    },
    setAttack(a){
        this.attack = a;
    },
    getAttack(){
        this.attack=(global.Data.mainArmsLevel*0.1+1)*this.skillbase.attack;

        if(!!global.usedFullLevel && global.gates!=0){
            this.attack=(99*0.1+1)*this.skillbase.attack;
        }

        if(this.skillbase.isSup){
            this.attack=(global.Data.childArm*0.1+1)*this.skillbase.attack
        }
        if(global.GameLoop.GameMgr.s_gameUI.weili.active){
            this.attack=this.attack*2;
        }
        return this.attack
    },
    setRect(arr){
        this.rect = {x:arr[0],y:arr[1],width:arr[2],height:arr[3]}
    },
    setColor(){
        if(this.node.parent.name=='BulletSelf'){
            this.node.color = new cc.Color(36,226,135);
        }
        
    },
    setDelayTime(t){
        this.delayTime = t;
    },
    onColliderEnter(no){
        var con = global.Enum.BulletType.continue
        this.node.emit('onCollider')
        switch(this.type){
            case global.Enum.BulletType.normal:{
                no.onAttack(this);
                
                this.node.sprite ? this.node.sprite.recovery() : this.node.destroy();
                return true;
            }
            case global.Enum.BulletType.single:{
                for(var i=0; i<this.attackMonster.length; i++){
                    if(this.attackMonster[i].monster == no){
                        // cc.log('冷却中:',this.attackMonster[i])
                        return false;
                    }
                }
                no.onAttack(this);
                this.attackMonster.push({
                    monster : no,
                    time : this.delayTime
                });
                return false;
            }
            break;
            case global.Enum.BulletType.continue:{
                if(this.delayTime == undefined){
                    console.error('没有设置延时伤害的时间')
                    return
                }
                let monster = null;
                for(var i=0; i<this.attackMonster.length; i++){
                    if(this.attackMonster[i].no == no){
                        monster = this.attackMonster[i];
                        break;
                    }
                }
                var now = new Date().getTime();
                if(!monster || monster.lastTime - now < this.delayTime){
                    return;
                }
                if(!monster){
                    this.attackMonster.push({no:no,lastTime:now});
                } else {
                    monster.lastTime = now;
                }
                no.onAttack(this);
            }
        }
        return true;
    },
    setOptions(skillbase,grow=1){
        /**
         *      attack: 100
                delay: 0
                dx: 20
                hit: 1
                name: "hero/Sup1_1"
                offset: 0
                rect: (4) [-25, -25, 50, 120]
         */
        // cc.log('grow:',grow);
        this.skillbase = skillbase;
        this.setAttack(skillbase.attack ? skillbase.attack : 20);
        if(skillbase.rect){
            this.setRect(skillbase.rect)
        }
        if(skillbase.hit){
            this.hit=skillbase.hit;
        }
    },
    update(dt){
        if(cc.isPauseGame){
            return;
        }
        var i=0; 
        while(i<this.attackMonster.length){
            this.attackMonster[i].time -= dt;
            if(this.attackMonster[i].time < 0){
                this.attackMonster.splice(i,1);
            } else {
                i++;
            }
        }
        if(global.GameLoop.GameMgr.s_gameUI.weili.active){
            this.setColor();
        }else{
            this.node.color = new cc.Color(255,255,255);
        }
        this.life += 0.016
    }
});
