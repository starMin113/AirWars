
cc.Class({
    extends: cc.Component,

    properties: {
        effectLayer : cc.Node
    },
    onLoad(){
        this.o_preloadPlaneRes = {}; // 加载的敌机资源
        this.o_preloadPath = {};// 加载的路径资源
        this.runTime = 0;
        this.o_playerCount = 0; //飞机出生的统计

        this.nextMonsterList = [];
        this.b_isGateOver = false;
        this.base=1//基础成长值
        this.n_effectTime = 0;
        this.n_effectCount = 0;
        this.n_effectData = null
        this.n_round = 0; //第几波怪

        global.NodePool.preload('bulletHit',global.Loader.get('game/hit'))
        global.NodePool.preload('bombeffect',global.Loader.get('game/BombEffect1'))
    },


    preloadMonster(name,prefab){ //预加载敌机
        this.o_preloadPlaneRes[name] = prefab;
        global.NodePool.preload('plane_'+name,prefab)
    },
    proloadPath(path,cb){
        var self = this;
        cc.loader.loadRes('base/path/'+path,function(err,res){
            cb(err,res)
            if(err){
                return cc.warn('加载路径失败:',path)
            }
            self.o_preloadPath[path] = JSON.parse(res);
        })
    },
    getRuningTime(){
        return this.runTime;
    },
    playBombEffect(monster){
        var boss = monster.node.getComponent('Boss')
        // var bomb = global.Loader.getInstantiate(boss?'game/BossBombEffect':'game/BombEffect');
        
        let bomb = global.NodePool.get('bombeffect',this.effectLayer)
        // var bomb = global.Loader.getInstantiate('game/BombEffect1');
        bomb.x = monster.node.x+(Math.random()-0.5)*monster.node.width;
        bomb.y = monster.node.y+(Math.random()-0.5)*monster.node.height;
        let time=0.3;
        if(!boss){
            var sx = Math.max(monster.node.width/40,1)
            var sy = Math.max(monster.node.height/40,1)
            bomb.scale = Math.max(sx/parseInt(monster.prefab.split('_')[1]),sy/parseInt(monster.prefab.split('_')[1]));
        }else{
            time=1.5
        }
        bomb.active = false;
        // cc.log('playBombEffect')
        this.scheduleOnce(()=>{
            bomb.active = true;
            bomb.getComponent('SpriteAnimate').startAnimate(1,function(){
                global.NodePool.put('bombeffect',bomb)
            });
            // this.effectLayer.addChild(bomb);
            // SoundMgr.playSound('Audio/Explode_m',false,0.5);
            // global.GameLoop.GameMgr.sound.playBomb()
        },Math.random()*time)
        
    },
    destroyMonster(monster){
        // smallBoss10
        let number=2;
        if(monster.prefab.substring(5,9)=='Boss' || monster.prefab.substring(0,4)=='boss'){
            number=10
        }else{
            number=parseInt(monster.prefab.split('_')[1]);
            number=(number==0||number)?number:3;
            // number = 1
        }
        for(let i=0;i<number;i++){
            this.playBombEffect(monster);
        }
        

        var relations = monster.option.relations;
        if(!relations){
            cc.warn('没有组员数据')
            return;
        }
        var name = monster.node.name;
        global.Common.removeArrayObj(relations,name);
        if(relations.length == 0 && monster.option.props){
            this.checkCreateProp(monster.option.props,monster.node)
        }
    },
    checkCreateProp(props,node){
        for(var i=0; i<props.length; i++){
            var prop = props[i];
            if(Math.random() < prop){
                global.GameLoop.GameMgr.addProp(i,node.getPosition());
            }
        }
    },


    createEnemyTeam(team){
        // var team = global.DataConfig.team[enemy.tid]
        var relations = [];
        for(let j=0; j<team.pids.length; j++){
            relations.push(''+this.o_playerCount++);
        }
        if(team.warn){
            global.Event.emit('bombhint');
        }
        var arrDelay = (team.createDelay instanceof Array)? team.createDelay : null
        for(let j=0; j<team.pids.length; j++){
            var dx = team.dx ?  team.dx: 0
            var dy = team.dy ?  team.dy: 0
            var x = typeof(team.x) == 'object' ? team.x[j] : team.x+dx*j;
            var y = typeof(team.y) == 'object' ? team.y[j] : team.y+dy*j;
            if(team['xoffset']){
                x+=team['xoffset']*global.Common.randomInteger();
            }
            if(team['yoffset']){
                y+=team['yoffset']*global.Common.randomInteger();
            }
            var m = global.DataConfig.monster[team.pids[j]]
            var cfg = global.Common.deepCopy(global.DataConfig.monster[team.pids[j]])
            let props=  team.prop;
            if(!team.prop && this.runTime < 20 && global.gates < 3){
                props = [0.8,0,0,0]
            }
            var obj = {
                time :arrDelay?arrDelay[j]:(team.createDelay*j || 0),
                prefab : cfg.prefab,
                teamId:team.pids[j],
                grow:team.grow==undefined?1:team.grow,
                keepTime:team.keepTime==undefined?false:team.keepTime,
                cfg : cfg,
                name:relations[j],
                relations : relations,
                props : props,
                x:x,
                y:y,
                additional:global.Common.deepCopy(team.additional)
            }
            this.nextMonsterList.push(obj)
        }
    },

    updateNextMonster(dt){
        let i=0;
        while(i<this.nextMonsterList.length){
            var obj = this.nextMonsterList[i];
            obj.time -= dt;
            if(obj.time < 0){
                this.nextMonsterList.splice(i,1);
                var node = global.NodePool.get('plane_'+obj.prefab,this.node)
                if(!node){
                    cc.warn('预制体没找到,',obj.prefab.name)
                    i++;
                    continue;
                }
                node.x = obj.x;
                node.y = obj.y
                node.name = obj.name;
                // this.node.addChild(node);
                var monster = node.getComponent('Monster');
                monster.poolInit();
                // if(this.runTime<20){
                //     obj.cfg.blood=5;
                // }
                
                monster.setOptions(obj,this);
                // var lb = new cc.Node().addComponent(cc.Label);
                // node.addChild(lb.node);
                // lb.string = obj.teamId
                // lb.fontSize = 24
                
            } else {
                i++;
            }
        }
    },

    addRandomEffects(effect){
        if(!effect || !effect.pids){
            cc.log('')
            return;
        }
        for(let j=0; j<effect.pids.length; j++){
            var x = Math.random() * (effect.x[1]-effect.x[0])+effect.x[0]
            var y = Math.random() * (effect.y[1]-effect.y[0])+effect.y[0]
    
            var prop = [0,0,0,0,0]
            var cfg = global.Common.deepCopy(global.DataConfig.monster[effect.pids[j]])
            var obj = {
                time :parseFloat(effect.createDelay?effect.createDelay:0)*j,
                prefab : cfg.prefab,
                grow:1,
                cfg:cfg,
                keepTime:false,
                name:effect.pids[j],
                props : prop,
                x:x,
                y:y
            }
            this.nextMonsterList.push(obj)
        }
    },

    onSkillEvent(eventcfg,bullet){
        if(!this.config.events){
            return;
        }
        var basex = bullet.node.x;
        var basey = bullet.node.y+bullet.node.height*0.5;

        var team = global.Common.deepCopy(this.config.events[eventcfg.event]);
        if(!team){
            return;
        }
        var relations = [];
        for(let j=0; j<team.pids.length; j++){
            relations.push(''+this.o_playerCount++);
        }
        for(let j=0; j<team.pids.length; j++){
            var dx = team.dx ?  team.dx: 0
            var dy = team.dy ?  team.dy: 0
            var x = typeof(team.x) == 'object' ? basex : basex+dx*j;
            var y = typeof(team.y) == 'object' ? basey : basey+dy*j;
            if(team['xoffset']){
                x+=team['xoffset']*global.Common.randomInteger();
            }
            if(team['yoffset']){
                y+=team['yoffset']*global.Common.randomInteger();
            }
            var m = global.DataConfig.monster[team.pids[j]]
            var cfg = global.Common.deepCopy(global.DataConfig.monster[team.pids[j]])
            let props=  team.prop;
            if(!team.prop && this.runTime < 20 && global.gates < 3){
                props = [0.8,0,0,0]
            }
            var obj = {
                time :parseFloat(team.createDelay?team.createDelay:0)*j,
                prefab : cfg.prefab,
                teamId:team.pids[j],
                grow:team.grow==undefined?1:team.grow,
                keepTime:team.keepTime==undefined?false:team.keepTime,
                cfg : cfg,
                name:relations[j],
                relations : relations,
                props : props || [0,0,0,0,0],
                x:x,
                y:y,
                additional:global.Common.deepCopy(team.additional)
            }
            this.nextMonsterList.push(obj)
        }
    },

    preloadConfig(cfg){ //预加载配置
        this.config = global.Common.deepCopy(cfg);
        this.refershWarn();
        return this.config
    },
    refershWarn(){
        this.n_effectTime = this.config.effects ? this.config.effects.round+global.Common.randomInteger()*this.config.effects.roundOffset : 0;
        var current = [];
        var lists = this.config.effects.list;
        for(var i=0; i<lists.length; i++){
            if(lists[i].weight <= this.n_effectCount){
                current.push(lists[i])
            }
        }
        
        this.n_effectCount++;
        if(current.length>0){
            var idx = Math.floor(Math.random() * current.length);
            this.n_effectData = current[idx]
        } else {
            this.n_effectTime = 0
        }
        // this.addRandomEffects(current[idx])
    },

    gameUpdate(dt){
        var isKeep = false
        var canPass = true;
        for(var c in this.node.children){
            var d = this.node.children[c];
            var monster = d.getComponent('Monster')
            monster.gameUpdate && monster.gameUpdate(dt);
            isKeep = isKeep || monster.keepTime;
            canPass = canPass && monster.canPass
        }
        if(!isKeep){
            let i=0;
            while(i<this.nextMonsterList.length){
                var next = this.nextMonsterList[i];
                if(next.cfg && next.cfg.keepTime){
                    isKeep = true;
                    break;
                }
                i++
            }
        }

        if(!isKeep && global.gates!=0){
            this.runTime += dt;
            var has = true;
            var team = this.n_round < this.config.enemys.length ? this.config.enemys[this.n_round] : null;
            if(team && team.time <= this.runTime && !team.isPass){
                team.isPass = true;
                this.createEnemyTeam(team);
                // if(team.keepTime){
                    this.runTime=0
                // }
                this.n_round ++;
            }
            if(this.n_round < this.config.enemys.length){
                has = false
            }

            // for(let i=this.n_round; i<this.config.enemys.length; i++){
            //     var team = this.config.enemys[i];
            //     if(team.time <= this.runTime && !team.isPass){
            //         team.isPass = true;
            //         this.createEnemyTeam(team);
            //         // if(team.keepTime){
            //             this.runTime=0
            //         // }
            //         this.n_round = i+1;
            //         // break;
            //     }
            //     if(team.time > this.runTime){
            //         has = false
            //     }
            // }
            if(has && !this.b_isGateOver && this.nextMonsterList.length == 0){
                this.b_isGateOver = has;
            }
            if(this.b_isGateOver && canPass){
                global.canPuse=false;
                global.GameLoop.GameMgr.onPassGate();
            }
        }else if(!isKeep && global.gates==0){
            this.runTime += dt;
            // var has = true;
                var team = this.config.enemys[0];
                if(team.time <= this.runTime){
                    cc.log(team.grow)
                    // team.grow= team.grow+team.grow*global.GameLoop.GameMgr.getAllTime()/50
                    team.grow=team.grow*this.base;
                    this.createEnemyTeam(team);
                    // team.grow = team.grow*1.5
                    this.config.enemys.shift();
                    this.config.enemys.push(team)
                    if(team.keepTime){
                        this.base+=0.02
                        this.runTime=0
                    }
                    
                }
        }
        if(this.n_effectTime>0){
            this.n_effectTime -= dt;
            if(this.n_effectTime <= 0){
                this.addRandomEffects(this.n_effectData)
                this.refershWarn();
            }
        }
        this.updateNextMonster(dt);
    }

});
