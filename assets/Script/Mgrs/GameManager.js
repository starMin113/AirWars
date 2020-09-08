
var State = {
    FREE: -1,
    CREATE_PLAYER: 0,
    PLAYING: 1,
    BOSS_CHANGE: 2,
    DIE: 3,
    OVER: 4
}

let instance = null;

var FrameManager = require('FrameManager')

cc.Class({
    extends: require('UI-PanelWindow'),

    properties: {
        control: require('GameControl'),
        bgMgr: require('BgManager'),
        monsterMgr: require('MonsterManager'),
        colliderMgr: require('ColliderManager'),
        propMgr: require('PropManager'),
        particleMgr: require('ParticleManager'),
        //TODO
        // superBomblauncher: require('SkillLauncher'),
        // sound : require('GameSound'),
        playerPrefab: [cc.Prefab],
        otherPlayerPrefab: [cc.Prefab],
        plotCfg: cc.JsonAsset,
        eventCfg: cc.JsonAsset
    },

    // LIFE-CYCLE CALLBACKS:

    statics: {
        Instance: instance
    },

    onLoad() {
        instance = this;
        global.Data.emp = 2;
        global.Data.bomb = 0;
        cc.isPauseGame = false;
        this.no_MonsterLayer = this.node.getChildByName('Monster')
        this.no_PropsLayer = this.node.getChildByName('Props')
        this.no_PlayerLayer = this.node.getChildByName('Player')

        this.no_BulletSelfLayer = this.node.getChildByName('BulletSelf')
        this.no_BulletMonsterLayer = this.node.getChildByName('BulletMonster')
        this.no_effectLayer = this.node.getChildByName('Effect')

        this.o_ResGameLoop = {}; //gameLoop中的资源组
        this.o_empData = []; //当前释放护盾的数据
        this.o_player = null;
        this.o_otherPlayer = null;
        this.s_gameUI = null; //ui界面的脚本
        this.o_gameData = {//游戏数据存放
            score: 0,   //分数
            time: 0    //游戏时长
        }
        this.runTime = 0; //运行总时间
        this.b_isPlaying = false;
        this.b_isPauseing = false;
        this.b_isPlayerDie = false; //
        this.bombTime = 0;
        global.canRelife = true;

        this.loadTimes = 0;

        global.regameCount = 0//复活、携带、满级次数
    },

    preloadScene(gate, pcb, fcb) {
        var door = cc.find('Canvas/door');
        let self = this;
        var base_gate = require('base_gate');

        // cc.loader.loadRes('base/gate', cc.JsonAsset, function (err, res) {
        var gateRes = new base_gate();
        // var gateRes=global.Common.readJson(res);
        if (global.gates == 0) {
            self.gateConfig = gateRes['1-1'];
            self.gateConfig.effects = gateRes['2-2'].effects
            self.gateConfig.bgbackups = [];
            self.gateConfig.bgbackups.push(gateRes['1-1'].bg);
            for (var key in gateRes) {
                if (key != '1-1' && key.match(/\d-\d/) != null) {
                    self.gateConfig.bgbackups.push(gateRes[key].bg);
                    for (var i = 10; i < gateRes[key].enemys.length; i++) {
                        self.gateConfig.enemys.push(gateRes[key].enemys[i]);
                    }
                }
            }
        } else {
            self.gateConfig = gateRes[gate];
        }
        self.gateConfig = self.monsterMgr.preloadConfig(self.gateConfig);
        cc.log('gateConfig:', self.gateConfig)//gate
        var async = new CCAsync();
        var loadBg = function (bgCb) {
            self.bgMgr.preload(self.gateConfig.bg, self.gateConfig.bgbackups, function (e, r) {
                pcb && pcb(0.3)
                bgCb(e, r)
            });
        }
        var loadGateConfig = function (gateCb) {
            var ac = new CCAsync();
            var arr = [];
            var obj = {};
            for (var i = 0; i < self.gateConfig.enemys.length; i++) {
                var team = self.gateConfig.enemys[i];

                for (let j = 0; j < team.pids.length; j++) {
                    var pid = team.pids[j]
                    if (obj[pid] == null) {
                        obj[pid] = 1;
                        let cfg = global.DataConfig.monster[pid]//monster
                        if (!cfg) {
                            cc.warn('没有这个配置?', pid, team)
                        }
                        arr.push(function (monsterCb) {
                            cc.loader.loadRes('plane/' + cfg.prefab, function (e, r) {
                                self.monsterMgr.preloadMonster(cfg.prefab, r);
                                monsterCb(e, { p: cfg.prefab, r: r });
                            })
                        })
                        for (var skey in cfg.status) {
                            let actions = cfg.status[skey];
                            for (var s in actions.skill) {
                                var skills = actions.skill[s];
                                for (let j = 0; j < skills.length; j++) {
                                    let skill = skills[j];
                                    if (skill.bulletTeam) {
                                        arr.push(function (monsterCb) {
                                            cc.loader.loadRes(skill.bulletTeam, function (e, r) {
                                                global.Loader.addPrefab(skill.bulletTeam, r);
                                                monsterCb(e, { p: cfg.prefab, r: r });
                                            })
                                        })
                                    }
                                    if (skill.prefab) {
                                        arr.push(function (monsterCb) {
                                            cc.loader.loadRes(skill.prefab, function (e, r) {
                                                global.Loader.addPrefab(skill.prefab, r);
                                                monsterCb(e, { p: cfg.prefab, r: r });
                                            })
                                        })
                                    }
                                }
                            }
                            // for(let i=0; i<actions.length; i++){
                            // let action = actions[i];

                            // }
                        }
                    }
                }
                if (team.additional && team.additional.list) { //boss有附带的小飞机，也要加载
                    for (let j = 0; j < team.additional.list.length; j++) {
                        var steam = team.additional.list[j]
                        for (let k = 0; k < steam.pids.length; k++) {
                            var pid = steam.pids[k]
                            if (obj[pid] == null) {
                                obj[pid] = 1;
                                let cfg = global.DataConfig.monster[pid]
                                if (!cfg) {
                                    cc.warn('没有这个配置?', pid, team)
                                }
                                arr.push(function (bossCb) {
                                    cc.loader.loadRes('plane/' + cfg.prefab, function (e, r) {
                                        self.monsterMgr.preloadMonster(cfg.prefab, r);
                                        bossCb(e, { p: cfg.prefab, r: r });
                                    })
                                })
                            }
                        }

                    }
                }
            }

            for (var ekey in self.gateConfig.events) {
                var team = self.gateConfig.events[ekey];

                for (let j = 0; j < team.pids.length; j++) {
                    var pid = team.pids[j]
                    if (obj[pid] == null) {
                        obj[pid] = 1;
                        let cfg = global.DataConfig.monster[pid]//monster
                        if (!cfg) {
                            cc.warn('没有这个配置?', pid, team)
                        }
                        arr.push(function (monsterCb) {
                            cc.loader.loadRes('plane/' + cfg.prefab, function (e, r) {
                                self.monsterMgr.preloadMonster(cfg.prefab, r);
                                monsterCb(e, { p: cfg.prefab, r: r });
                            })
                        })
                    }
                }
                if (team.additional && team.additional.list) { //boss有附带的小飞机，也要加载
                    for (let j = 0; j < team.additional.list.length; j++) {
                        var steam = team.additional.list[j]
                        for (let k = 0; k < steam.pids.length; k++) {
                            var pid = steam.pids[k]
                            if (obj[pid] == null) {
                                obj[pid] = 1;
                                let cfg = global.DataConfig.monster[pid]
                                if (!cfg) {
                                    cc.warn('没有这个配置?', pid, team)
                                }
                                arr.push(function (bossCb) {
                                    cc.loader.loadRes('plane/' + cfg.prefab, function (e, r) {
                                        self.monsterMgr.preloadMonster(cfg.prefab, r);
                                        bossCb(e, { p: cfg.prefab, r: r });
                                    })
                                })
                            }
                        }

                    }
                }
            }

            for (var ekey in self.gateConfig.effects.list) { //加载随机事件
                var team = self.gateConfig.effects.list[ekey];
                for (let j = 0; j < team.pids.length; j++) {
                    var pid = team.pids[j]
                    if (obj[pid] == null) {
                        obj[pid] = 1;
                        let cfg = global.DataConfig.monster[pid]//monster
                        if (!cfg) {
                            cc.warn('没有这个配置?', pid, team)
                        }
                        arr.push(function (monsterCb) {
                            cc.loader.loadRes('plane/' + cfg.prefab, function (e, r) {
                                self.monsterMgr.preloadMonster(cfg.prefab, r);
                                monsterCb(e, { p: cfg.prefab, r: r });
                            })
                        })
                    }
                }
            }

            if (self.gateConfig.base) {
                for (var i = 0; i < self.gateConfig.base.length; i++) {
                    var team = self.gateConfig.base[i];

                    for (let j = 0; j < team.pids.length; j++) {
                        var pid = team.pids[j]
                        if (obj[pid] == null) {
                            obj[pid] = 1;
                            let cfg = global.DataConfig.monster[pid]//monster
                            if (!cfg) {
                                cc.warn('没有这个配置?', pid, team)
                            }
                            arr.push(function (baseCb) {
                                let name = this
                                cc.loader.loadRes('plane/' + name, function (e, r) {
                                    self.monsterMgr.preloadMonster(name, r);
                                    baseCb(e, { p: cfg.prefab, r: r });
                                })
                            }.bind(cfg.prefab))
                        }
                    }
                }
            }

            for (var i = 0; self.gateConfig.boss && i < self.gateConfig.boss.length; i++) {
                var team = self.gateConfig.boss[i];

                for (let j = 0; j < team.pids.length; j++) {
                    var pid = team.pids[j]
                    if (obj[pid] == null) {
                        obj[pid] = 1;
                        let cfg = global.DataConfig.monster[pid]//monster
                        if (!cfg) {
                            cc.warn('没有这个配置?', pid, team)
                        }
                        arr.push(function (cb) {
                            let name = this
                            cc.loader.loadRes('plane/' + name, function (err, r) {
                                self.monsterMgr.preloadMonster(name, r);
                                cb(err, { p: cfg.prefab, r: r });
                            })
                        }.bind(cfg.prefab))
                    }
                }

                if (team.additional && team.additional.list) { //boss有附带的小飞机，也要加载
                    for (let j = 0; j < team.additional.list.length; j++) {
                        var steam = team.additional.list[j]
                        for (let k = 0; k < steam.pids.length; k++) {
                            var pid = steam.pids[k]
                            if (obj[pid] == null) {
                                obj[pid] = 1;
                                let cfg = global.DataConfig.monster[pid]
                                if (!cfg) {
                                    cc.warn('没有这个配置?', pid, team)
                                }
                                arr.push(function (cb) {
                                    let name = this
                                    cc.loader.loadRes('plane/' + name, function (e, r) {
                                        self.monsterMgr.preloadMonster(name, r);
                                        cb(e, { p: cfg.prefab, r: r });
                                    })
                                }.bind(cfg.prefab))
                            }
                        }

                    }
                }
            }

            ac.parallel(arr, function (err, res) {
                cc.log('da:', res)
                pcb && pcb(1)
                gateCb(err, res);
            })
            // })
        }

        async.parallel([loadBg, loadGateConfig], function (err, res) {
            if (err) {
                console.log('资源加载失败，正在重新加载:', err);
                self.loadTimes++;
                if (self.loadTimes >= 3) {
                    global.GameLoop.enterSelectPlane();
                    door.js.moveOut();
                    global.EJMgr.showToast('资源加载失败');
                    return;
                }
                self.preloadScene(gate, pcb, fcb)
                return;
            }
            self.s_gameUI = self.createUI();
            // door.js.moveOut(self.beforeStartLogin.bind(self));
            door.js.moveOut(self.startLogic.bind(self));
            fcb && fcb();
        })
        // })
    },

    onDestroy() {
        cc.isPauseGame = false;
        cc.director.getActionManager().resumeTargets(this.pauseActions);

    },

    beforeStartLogin() {
        if (!this.n_isShowPlot && global.gates != 0 && global.gates != -1) {
            // this.n_isShowPlot = true;
            // this.startPlot('start', this.startLogic.bind(this));
        } else {
            this.startLogic()
        }
    },

    startPlot(key, cb) { //1-1  start boosstart
        if (this.plotCfg.json[global.gates] && this.plotCfg.json[global.gates][key]) {
            this.pauseGame();
            global.UIMgr.pushUI('game/GamePlot', 'GamePlot', {
                cb: function () {
                    this.resumeGame();
                    cb && cb();
                }.bind(this), status: key
            });
        } else {

        }
    },

    startLogic() {
        this.o_ResGameLoop = global.Resources['GameLoop']
        this.state = State.CREATE_PLAYER
        this.b_isPlaying = true;
        this.createPlayer();
    },

    createUI() {
        var node = global.UIMgr.addUI('game/GameUI')
        return node.getComponent('GameUI')
    },

    getPlayer() {
        return this.o_player;
    },
    createPlayer() {

        global.canPuse = true;
        this.s_gameUI.setProgress();
        if (!this.no_PlayerLayer || this.o_player) {
            return
        }
        // global.planeId = 1;
        var id = global.planeId; //用的哪个角色 目前0 ~ 3
        var playerNode = cc.instantiate(this.playerPrefab[id]);
        this.no_PlayerLayer.addChild(playerNode);
        var player = playerNode.getComponent('Player')
        var cfg = global.DataConfig.monster['player' + (id + 1)]
        player.setOptions(global.DataConfig.monster['player' + (id + 1)], this.s_gameUI)
        this.control.setPlayer(player)
        player.restart();
        this.b_isPlayerDie = false
        this.o_player = player;
        this.isSlow = false
        // this.createOtherPlayer(2)  //0，1，2三种辅助飞机
    },
    createOtherPlayer(planeId) {
        var id = planeId;
        var playerNode = cc.instantiate(this.otherPlayerPrefab[id]);
        this.no_PlayerLayer.addChild(playerNode);
        var player = playerNode.getComponent('OtherPlayer')
        player.setOptions(global.DataConfig.monster['supPlane' + (id + 1)], this.s_gameUI)
        playerNode.x = -200;
        playerNode.y = -1440;
        playerNode.runAction(cc.sequence(cc.moveBy(1, cc.v2(0, 1180)), cc.callFunc(() => {
            global.Event.emit('OTHERPLANE')
        })));
        this.o_otherPlayer = player
    },

    creatBossPlane(id, x, y) {
        // this.starNumber=3;
        // if(this.starNumber===3){
        //     var playerNode = cc.instantiate(this.otherPlayerPrefab[id]);
        //     this.no_PlayerLayer.addChild(playerNode);
        //     playerNode.x = x;
        //     playerNode.y = y;
        //     playerNode.runAction(cc.moveTo(1,cc.v2(this.getPlayer().node.x-100,this.getPlayer().node.y-100)))
        //     var player = playerNode.getComponent('OtherPlayer')
        //     player.setOptions(global.DataConfig.monster['supPlane' + (id + 1)], this.s_gameUI);
        //     this.o_otherPlayer = player;
        // }else{
        //     global.EJMgr.showToast('达到三星可获得僚机')
        // }
    },

    addProp(type, point) {
        this.no_PropsLayer.getComponent('PropManager').createProp(type, point);
        global.Event.emit('NOTICE', { type: 0 })
    },

    isPause() {
        return this.b_isPauseing;
    },

    pauseGame() { //暂停
        if (!this.b_isPauseing) {
            this.b_isPauseing = true;
            this.control.setPlayer(null)
            this.pauseActions = cc.director.getActionManager().pauseAllRunningActions();
            this.node.pause = true;
            cc.isPauseGame = true;
        }
    },
    resumeGame() {//恢复
        cc.log('恢复游戏');
        if (this.b_isPauseing) {
            this.b_isPauseing = false;
            this.control.setPlayer(this.o_player)
            cc.director.getActionManager().resumeTargets(this.pauseActions)
            this.node.pause = false;
            cc.isPauseGame = false;
        }
    },

    addCoin(coin) { //拾取到了金币
        // var coinBei;
        // if(global.gates!=0 && global.gates!=-1){
        //     coinBei=((parseInt(global.gates.split('-')[0])-1)*4+parseInt(global.gates.split('-')[1]));
        // }else{
        //     coinBei=10
        // }

        this.o_gameData.score += coin;
        this.s_gameUI.updateScore(this.o_gameData.score);
    },

    attackPlayer() { //击中主角
        if (!global.canHit) {
            return
        }
        if (CC_WECHATGAME && wx['vibrateShort']) {
            wx.vibrateShort()
        }
        for (var i = 0; i < 2; i++) {
            this.no_PropsLayer.getComponent('PropManager').createProp(0, this.o_player.node.getPosition());
        }
        global.canPuse = false
        this.onPlayerDie();
    },

    onReleaseEmp() { //释放护盾
        var hudun = global.Loader.getInstantiate('game/hudun');
        this.node.addChild(hudun)
        hudun.setPosition(this.o_player.node.getPosition());
        this.o_empData.push({ time: 0, target: hudun, point: cc.v2(hudun.x, hudun.y) })
    },
    keepEmp(time) {
        this.o_player.setEmp(time)
    },
    onReleaseBomb() {//释放炸弹

        if (this.o_player && !this.o_player.b_isDie) {
            console.log('onReleaseBomb')
            var bombstatus = global.DataConfig.monster['playerBomb']['status']
            this.superBomblauncher.reset();
            this.superBomblauncher.addLauncher(bombstatus[0])
            // this.s_gameUI.updateBomb()
            this.bombTime = 3;
            this.boom = true;
        } else {
            this.boom = false;
        }
        return this.boom
    },

    onPlayerDie() { //玩家死亡
        if (!this.o_player || this.o_player.b_isDie) {
            return;
        }
        global.Event.emit('PLAYERDIE');
        var self = this;
        var level = this.o_player.level;
        this.b_isPlayerDie = true;
        this.control.setPlayer(null)//释放控制
        this.o_player.stopFire();
        this.o_player.die();
        var pos = this.o_player.node.getPosition()
        var propMgr = this.no_PropsLayer.getComponent('PropManager')
        this.o_player.node.runAction(cc.sequence(cc.blink(1, 2), cc.callFunc(function () {
            for (var i = 0; i < level; i++) {
                propMgr.createProp(0, pos, true);
            }
            propMgr.createProp(1, pos, true);
            self.o_player.node.destroy();
            self.o_player = null;
            self.scheduleOnce(self.showGameOver.bind(self), 2)
        })));
    },

    showGameOver() { //显示结算
        this.pauseGame();
        var res = global.EJMgr.pushUI('game/GameResult')
        var gr = res.getComponent('GameUI-Result')
        gr.setOptions({
            result: false,
            score: this.o_gameData.score
        })
    },
    onRelife() { //玩家重生
        var self = this;
        var pause = global.UIMgr.pushUI('game/GamePause')
        pause.getComponent('GameUI-Pause').setOptions({
            revert: true, cb: function () {
                self.createPlayer();
                self.scheduleOnce(() => {
                    if (global.gates == 0 && global.bossDieCount % 2 == 0 && global.bossDieCount > 0) {
                        self.onAfterVideo()
                    }
                }, 2)
                // self.keepEmp(6)
                self.o_player.setIgnore(true, 6)
            }
        })
    },

    onAfterVideo() {//无尽模式打完boss观看视频
        if (!this.b_isPlayerDie) {
            this.pauseGame();
            global.EJMgr.pushUI("game/PlayVideoContinue");
        }
    },

    otherPlayerOut() {
        if (this.o_otherPlayer) {
            this.o_otherPlayer.node.destroy();
            this.o_otherPlayer = null;
        }
    },

    onPassGate() {   //通过本关
        if (!this.o_player) {
            return
        }
        this.b_isPlaying = false;
        this.control.setPlayer(null)//释放控制

        if (this.o_otherPlayer) {
            this.o_otherPlayer.stopFire();
        }
        let passGoldCoins = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000];
        this.o_player.stopFire();
        SoundMgr.playSound('Audio/sprint')
        var self = this;
        this.o_player.node.runAction(cc.sequence(cc.delayTime(1), cc.moveBy(1, cc.v2(0, 1500)), cc.callFunc(function () {
            self.pauseGame();
            self.httpGet('/game/gameUser', 'attrAdd', { propName: "currentPass", count: 1 }, function (err, res) {
                if (err) {
                    self.scheduleOnce(function () {
                        global.GameLoop.enterSelectPlane();
                    }, 2)
                    return;
                }
                global.Data.currentPass++;
                let result = global.EJMgr.pushUI('game/GameResult')
                result.getComponent('GameUI-Result').setOptions({
                    result: true,
                    score: self.o_gameData.score,
                    coin: passGoldCoins[global.Data.currentPass - 1],
                    star: 3
                })
            })
        })));


    },


    getAllTime() { //关卡运行的总时间 不包括暂停
        return this.runTime;
    },

    getRuningTime() { // 配置中的时间走到了哪里
        return this.monsterMgr.getRuningTime();
    },

    cleanResources() {
        this.b_isPlaying = false;
        global.Common.removeChildByName(global.UIMgr.node, 'GameUI')
    },

    updateEmpData(dt) {
        if (this.o_empData.length == 0) {
            return
        }

        var i = 0;
        while (i < this.o_empData.length) {
            var emp = this.o_empData[i];
            emp.time += dt;
            emp.target.width = emp.time / 1.0 * (3168 - 176) + 176
            emp.target.height = emp.target.width

            if (emp.time > 1.0) {
                emp.target.destroy()
                this.o_empData.splice(i, 1);
            } else {
                i++
            }
        }
        var bullets = this.colliderMgr.getBullet(global.Enum.CAMP.enemy)
        var j = 0;
        while (j < bullets.length) {
            var bullet = bullets[j].node
            var start = global.GameLoop.GameMgr.no_BulletSelfLayer.convertToWorldSpaceAR(cc.v2(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2))
            var bulletRect = cc.rect(start.x, start.y, bullet.width, bullet.height)
            var hbreak = false;
            for (var i = 0; i < this.o_empData.length; i++) {
                var target = this.o_empData[i].target;
                var rect = cc.rect(target.x - target.width / 2, target.y - target.height / 2, target.width, target.height)
                if (rect.intersects(bulletRect)) {
                    this.particleMgr.createCoin(10, bullets[j]);
                    var ps = bullet.getComponent('ParticleSprite');
                    ps ? ps.recovery() : bullet.destroy();
                    bullets.splice(0, 1)
                    hbreak = true;
                    break;
                }
            }
            if (!hbreak) {
                j++
            }
        }
        // for (var j = 0; j < bullets.length; j++) {
        //     var bullet = bullets[j].node
        //     var start = global.GameLoop.GameMgr.no_BulletSelfLayer.convertToWorldSpaceAR(cc.v2(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2))
        //     var bulletRect = cc.rect(start.x, start.y, bullet.width, bullet.height)
        //     for (var i = 0; i < this.o_empData.length; i++) {
        //         var target = this.o_empData[i].target;
        //         var rect = cc.rect(target.x - target.width / 2, target.y - target.height / 2, target.width, target.height)
        //         if (rect.intersects(bulletRect)) {
        //             this.particleMgr.createCoin(10, bullets[j]);
        //             bullet.destroy();
        //             break;
        //         }
        //     }
        // }
    },

    updateOtherLogic(dt) {
        if (this.o_player) {
            this.o_player.gameUpdate(dt);
        }
        this.bgMgr.gameUpdate(dt);
        this.monsterMgr.gameUpdate(dt);
        this.propMgr.gameUpdate(dt);
        this.particleMgr.gameUpdate(dt);
        this.colliderMgr.gameUpdate(dt);
        FrameManager.gameUpdate(dt);
    },

    showTestPlayEnd() {
        global.EJMgr.loadLayer('TestPlayEnd', 0)
        this.b_isPauseing = true;
    },

    update(dlt) {
        var dt = this.isSlow ? dlt * 0.05 : dlt
        if (!this.b_isPlaying || this.b_isPauseing) {
            if (this.b_isPlaying && this.b_isPlayerDie) { //如果是玩家死亡状态会刷新道具的移动
                this.propMgr.gameUpdate(Math.min(dt, 0.016));
            }
            if (!this.b_isPlaying) {//过关子弹按正常速度移动
                FrameManager.gameUpdate(dlt);
            }
            return;
        }
        var ld = Math.floor(this.runTime)
        this.runTime += dt;
        var ad = Math.floor(this.runTime)


        this.updateOtherLogic(dt);
        this.updateEmpData(dt);
        if (this.bombTime >= 0) {
            this.bombTime -= 0.016; //暂停时有BUG
            // cc.log('bombTime',this.bombTime)
            if (this.bombTime <= 0) {
                console.log('superBomblauncher reset')
                this.superBomblauncher.reset();
            }
        }
        if (global.isTestPlay && ld != ad && ad == 20) {
            this.showTestPlayEnd();
            global.isTestPlay = false;
        }
    },
    lateUpdate(dt) {
        if (!this.b_isPlaying || this.b_isPauseing) {
            return;
        }
        this.colliderMgr.lateGameUpdate(dt);
    }
});
