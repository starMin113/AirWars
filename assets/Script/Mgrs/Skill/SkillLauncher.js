var ParticleSystem = require('ParticleSystem')
var Bullet = require('Bullet')
var instanceId = 0
cc.Class({
    extends: cc.Component,

    properties: {
        grow :{
            default : 1,
            visible : false
        }
    },

    onLoad() {

        this.monster = this.node.parent.getComponent('Monster')
        if (this.monster) {
            this.s_baseName = this.monster.name.substring(this.monster.name.indexOf('<') + 1, this.monster.name.indexOf('>')) + '-launcher'
        } else {
            this.s_baseName = '';
        }
        this.poolInit();
        this._launchers = [];
    },

    poolInit(){
        this.skills = [];
        if(this.o_laserObject){
            for (var i = 0; i < this.o_laserObject.length; i++) {
                var obj = this.o_laserObject[i];
                obj.node.destroy();
            }
        }
        this.o_laserObject = [];
        this.reset();
        this.launchers = {};
        this.b_isVitual = false;
    },

    setSkillParentNode(node, vitual = false) {
        if(this.skillParentNode){
            // this.offEvent();
        }
        this.skillParentNode = node
        
        if (!vitual) {
            node.off('child-added',this.onAddChild, this)
            node.off('child-removed',this.onRemoveChild, this)
            node.on('child-added', this.onAddChild, this)
            node.on('child-removed', this.onRemoveChild, this)
        }
        this.b_isVitual = vitual;
    },
    reset() {
        this.unscheduleAllCallbacks();
        var children = this.node.children
        for(var i=0; i<children.length; i++){
            var ps = children[i].getComponent('ParticleSprite');
            if(ps){
                // ps.recovery();
            } else {
                children[i].destroy();
            }
        }
        // var chd1 = this.skillParentNode ? this.skillParentNode.children : this.node.children
        // for(var i=0; i<children.length; i++){
        //     var ps = children[i].getComponent(ParticleSystem);
        //     if(ps){
        //         ps.node.destroy();
        //     }
        // }
        // this.node.destroyAllChildren();
        for (var i = 0; i < this.o_laserObject.length; i++) {
            var obj = this.o_laserObject[i];
            obj.node.destroy();
        }
        this.o_laserObject = [];
        this._launchers = [];
    },

    offEvent() {
        if (this.skillParentNode) {
            this.skillParentNode.off('child-added', this.onAddChild, this)
            this.skillParentNode.off('child-removed', this.onRemoveChild, this)
        }
    },

    addLauncher(skills) {
        this.n_instanceId = instanceId++
        if (!this.skillParentNode) {
            this.skillParentNode = global.GameLoop.GameMgr.no_BulletSelfLayer
        }
        // cc.log('grow:',this.grow);
        this.skills = skills;
        var self = this;
        var jiguangPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.width - cc.winSize.width / 2, -cc.winSize.height))
        var selfPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.width - cc.winSize.width / 2, -cc.winSize.height/2))


        var someParticleSystems = {};
        for (var i = 0; i < skills.length; i++) {
            let skillbase = global.Common.deepCopy(skills[i]);
            skillbase.camp = this.monster ? this.monster.camp : global.Enum.CAMP.friend;
            if(skillbase.bulletTeam){
                let ps = global.Loader.getInstantiate(skillbase.bulletTeam)
                this.skillParentNode.addChild(ps) //添加一个粒子发射器
                ps.setPosition(selfPos);
                ps.getComponent('AutoMove').setOptions(skillbase.teamData)
                ps.getComponent('AutoMove').setAutoUpdate(this.b_isVitual)
            } if (skillbase.prefab) { //激光发射器
                let ps = global.Loader.getInstantiate(skillbase.prefab)
                if (this.b_isVitual) {
                    // ps.removeComponent(Bullet)
                    var bullet = ps.getComponent('Bullet');
                    bullet._destroyImmediate()
                    ps.y = -20
                    this.skillParentNode.addChild(ps) //添加一个粒子发射器
                } else {
                    this.skillParentNode.addChild(ps) //添加一个粒子发射器
                    var bullet = ps.getComponent('Bullet');
                    bullet.setDelayTime(skillbase.dt);
                    bullet.setOptions(skillbase,this.grow)

                    var selfPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.width - cc.winSize.width / 2, -cc.winSize.height))
                    

                    var name = skillbase.prefab.split('/')[2].split('_')[1];
                    if (name == 'jiguang1' || name == 'jiguang2') {
                        ps.rotation = skillbase.r ? skillbase.r : 0;

                        if (skillbase['dx']) ps.x = skillbase['dx'];
                        if (skillbase['dy']) ps.y = skillbase['dy'];
                        // var selfPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.width - cc.winSize.width / 2, -cc.winSize.height))
                        ps.setPosition(jiguangPos);

                        this.o_laserObject.push({
                            dx: jiguangPos.x - ps.x,
                            dy: jiguangPos.y - ps.y,
                            dr: this.node.rotation - ps.rotation,
                            node: ps
                        });
                        this.updateLaserPosition();
                    } else {
                        ps.setPosition(selfPos.add(cc.v2(0,cc.winSize.height/2)))
                    }

                }



            } else if (skillbase.name) { //粒子子弹发射器
                var action = skillbase.action || ''
                let skillName = skillbase.name+action
                var sps = someParticleSystems[skillName]
                if(!sps){
                    sps = [];
                    someParticleSystems[skillName] = sps;
                }
                sps.push({
                    name : skillName,
                    skillbase:skillbase,
                    dx : skillbase.dx || 0,
                    dy : skillbase.dy || 0,
                    dr : skillbase.r || 0
                })
            }
        }

        for(var skillkey in someParticleSystems){
            let team = someParticleSystems[skillkey];
            let skillbase = team[0].skillbase;
            let skillName = skillbase.name

            let particle = global.Common.deepCopy(global.SkillConfig[skillName])
                if (!particle) {
                    cc.warn('没有找到粒子文件')
                    continue;
                }
                particle.poolName = skillbase.poolName || skillName
                var nodename = skillName.substring(Math.max(skillName.indexOf('/') + 1, 0));
                let ps = new cc.Node().addComponent(ParticleSystem);
                ps.setAutoUpdate(this.b_isVitual)
                ps.node.name = nodename
                this.node.addChild(ps.node) //添加一个粒子发射器
                this._launchers.push(ps);

                // ps.node.rotation = skillbase.r ? skillbase.r : 0;

                // if (skillbase['dx']) ps.node.x = skillbase['dx'];
                // if (skillbase['dy']) ps.node.y = skillbase['dy'];
                if(skillbase['repeat']) particle.repeat = skillbase['repeat']
                if(skillbase['emissionRate']) particle.emissionRate = skillbase['emissionRate']
                if(skillbase['speed']) particle.speed = skillbase['speed']
                if(skillbase['spriteFrame']) particle.spriteFrame = skillbase['spriteFrame']
                if(skillbase['roffset']) ps.node.rotation+= skillbase['roffset'] * global.Common.randomInteger()

                this.launchers[skillName] = skillbase;

                ps.node._skillBase = skillbase

                ps.setParticleLayer(this.skillParentNode)
                ps.setLauncherData(team)
                ps.loadData(particle);

                ps.addEvent(ParticleSystem.Event.CREATE, this.onParticleCreate.bind(this))
                ps.addEvent(ParticleSystem.Event.REPEAT, this.onParticleRepeat.bind(this))
                ps.addEvent(ParticleSystem.Event.ALL_FINISH, this.onParticleFinish.bind(this))

                skillbase.delay = skillbase.delay ? skillbase.delay : 0
                skillbase.offset = skillbase.offset ? skillbase.offset : 0
                var time = skillbase.delay + skillbase.offset * Math.random() * (Math.random() < 0.5 ? -1 : 1)
                if (time != 0) {
                    ps.enabled = false;
                    this.scheduleOnce(function () {
                        ps.enabled = true
                        skillbase.action && self.runSkillAction(skillbase.action, ps.node)
                    }, time)
                } else {
                    skillbase.action && this.runSkillAction(skillbase.action, ps.node)
                }
        }
    },
    onDestroy() {
        // this.offEvent();
    },
    runSkillAction(data, node) {
        var arr = data.split(',')
        var type = arr[0];
        var action = null;
        if (type == 'r') {
            node.rotation = parseFloat(arr[2])
            action = cc.rotateTo(parseFloat(arr[1]), parseFloat(arr[3]));
        } else if (type == 'mb') {
            action = cc.moveTo(parseFloat(arr[1]), cc.v2(parseFloat(arr[2]), parseFloat(arr[3])));
        }
        node.runAction(action)
    },

    onAddChild(event) {
        if (!event._source) { //非粒子子弹
            return;
        }
        // cc.log('onAddChild:',event._id)
        var skillbase = event._source
        var node = event;

        var bullet = node.getComponent('Bullet')
        if (!bullet) {
            bullet = node.addComponent('Bullet')
            // var camp = this.monster ? this.monster.camp : global.Enum.CAMP.friend
            bullet.setCamp(skillbase.camp)
        }
        bullet.setOptions(skillbase,this.grow)
        

        if (skillbase.track) { //是跟踪子弹
            let atb = node.getComponent('AutoTrackBullet');
            if(!atb){
                atb = node.addComponent('AutoTrackBullet');
            }
            atb.setAutoUpdate(this.b_isVitual)
            atb.scheduleOnce(function () {
                atb.startTrack();
            }, 0.05)
        }
        if(skillbase.events){
            let eb = node.getComponent('EventsBullet');
            if(!eb){
                eb = node.addComponent('EventsBullet');
            }
            eb.setOptions(skillbase.events,this.onSkillEvent.bind(this));
        }
        if (skillbase.type != undefined) {
            bullet.setType(skillbase.type)
            bullet.setDelayTime(parseFloat(skillbase.dt))
        }
    },

    onRemoveChild(event) {
        // cc.log('onRemoveChild',event.name)
    },

    onParticleCreate(no) {

        if (no.detail) {
            no.detail.setAutoUpdate(this.b_isVitual)
            var camp = this.monster ? this.monster.camp : global.Enum.CAMP.friend;
            var skillBase = no.detail.node._source
            if(skillBase.path){ //自定义子弹路径
                var pathReady = no.detail.addComponent('PathReady')
                var path = global.PathConfig[skillBase.path];
                if(path){
                    no.detail.enabled = false;
                    pathReady.target = no.detail.node;
                    pathReady.loadData(path);
                    if(skillBase.pathFlip){
                        pathReady.setFlip(skillBase.pathFlip.x,skillBase.pathFlip.y)
                    }
                    pathReady.runAction(1,function(){
                        no.detail.node.removeComponent('PathReady')
                        no.detail.recovery()
                        // no.detail.node.destroy();
                    })
                    pathReady.setAutoUpdate(this.b_isVitual)
                }
            } else if (camp == 2 && skillBase && skillBase.isLong && skillBase.isLong == 1 && global.GameLoop.GameMgr.getPlayer()) {
                var speed = no.detail.node._particle.speedInit;

                var p1 = no.detail.node.getPosition();
                var p2 = global.GameLoop.GameMgr.getPlayer().node.getPosition();

                var len = p2.sub(p1).mag()
                var a = Math.acos((p2.x - p1.x) / len)
                var r = a;
                if (p2.y < p1.y) {
                    r = 2 * Math.PI - r;
                }
                // // r = Math.PI /3;
                // cc.log('角度',r*180/Math.PI);
                var dx = Math.cos(r) * speed
                var dy = Math.sin(r) * speed
                no.detail.node._particle.speed = cc.v2(dx, dy)
                no.detail.node.rotation = 270 - r * 180 / Math.PI
            }
        }

    },
    onParticleFinish(e) {
        cc.log(e.target.node.name + '发射完成,');
        // e.target.layer._hasActive = false;
    },
    onParticleRepeat(repeat) {
    },
    runAngleAction() {

    },

    onSkillEvent(eventBullet,bullet){ //子弹的事件处理
        if(!this.node){return}
        // var camp = this.monster ? this.monster.camp : global.Enum.CAMP.friend;
        // var position=node.getPosition();
        global.GameLoop.GameMgr.monsterMgr.onSkillEvent(eventBullet,bullet)
    },

    updateLaserPosition() { //更新激光类子弹的位置
        var selfPos = this.node.convertToWorldSpaceAR(cc.v2(this.node.width / 2, this.node.height / 2))
        for (var i = 0; i < this.o_laserObject.length; i++) {
            var obj = this.o_laserObject[i];
            obj.node.x = obj.dx + selfPos.x - cc.winSize.width / 2
            obj.node.y = obj.dy + selfPos.y - cc.winSize.height / 2
            obj.node.rotation = obj.dr + this.node.rotation
        }
    },
    gameUpdate(dt) {
        this.updateLaserPosition();
    }
});
