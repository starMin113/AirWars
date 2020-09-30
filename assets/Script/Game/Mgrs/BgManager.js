
cc.Class({
    extends: cc.Component,

    properties: {
        bgmodel : cc.Prefab
    },

    onLoad(){
        this.back =[];
        this.front = [];
        this.front1 = [];
        this.resources = [];
        this.lastIdx =0 ;
        this.speed=1.5;
    },

    preload(arr,backups,cb){
        this.arr = arr;
        this.backups = backups;
        this.node.removeAllChildren();
        var res = [];
        for(var i=0; i<arr.back.length; i++){
            res.push('base/bg/'+arr.back[i])
        }
        for(var i=0; i<arr.front.length; i++){
            res.push('base/bg/'+arr.front[i])
        }
        for(var i=0; i<arr.front1.length; i++){
            res.push('base/bg/'+arr.front1[i])
        }

        if(backups){
            for(let j=0; j<backups.length; j++){
                var tempArr = backups[j];
                for(var i=0; i<tempArr.back.length; i++){
                    res.push('base/bg/'+tempArr.back[i])
                }
                for(var i=0; i<tempArr.front.length; i++){
                    res.push('base/bg/'+tempArr.front[i])
                }
                for(var i=0; i<tempArr.front1.length; i++){
                    res.push('base/bg/'+tempArr.front1[i])
                }
            }
        }

        var self = this;
        cc.loader.loadResArray(res,cc.SpriteFrame,function(e,r){
            if(e){
                return cb(e,null)
            }
            var startY  = 640 - cc.winSize.height/2
            for(var j=0; j<r.length; j++){
                var na = r[j]._name
                self.resources[na] = r[j];
                for(let k=0; k<arr.back.length; k++){
                    if(arr.back[k] == na){
                        var bg = cc.instantiate(self.bgmodel);
                        self.node.addChild(bg);
                        bg.getComponent(cc.Sprite).spriteFrame = r[j];
                        bg.y = startY+self.back.length * 1280
                        self.back.push(bg);
                        break;
                    }
                }

                for(let k=0; k<arr.front.length; k++){
                    if(arr.front[k] == na){
                        var bg = cc.instantiate(self.bgmodel);
                        self.node.addChild(bg);
                        bg.getComponent(cc.Sprite).spriteFrame = r[j];
                        bg.y = startY+self.front.length * 1280
                        self.front.push(bg);
                        break;
                    }
                }
                
                for(let k=0; k<arr.front1.length; k++){
                    if(arr.front1[k] == na){
                        var bg = cc.instantiate(self.bgmodel);
                        self.node.addChild(bg);
                        bg.getComponent(cc.Sprite).spriteFrame = r[j];
                        bg.y = startY+self.front1.length * 1280
                        self.front1.push(bg);
                        break;
                    }
                }
            }

            
            cb(null,1);
        })
    },

    changeBg(){
        if(global.gates != 0){
            return;
        }
        var idx;
        do {
            idx = Math.floor(Math.random() * this.backups.length);
        } while(idx == this.lastIdx);
        this.lastIdx = idx;
        
        var arr = this.backups[idx];

        for(let k=0; k<arr.front1.length; k++){
            var node = this.front1[k]
            if(node.y >= 1280){
                node.getComponent(cc.Sprite).spriteFrame = this.resources[arr.front1[k]];
            }else {
                node.nextSf = this.resources[arr.front1[k]];
            }
        }

        for(let k=0; k<arr.front.length; k++){
            var node = this.front[k]
            if(node.y >= 1280){
                node.getComponent(cc.Sprite).spriteFrame = this.resources[arr.front[k]];
            }else {
                node.nextSf = this.resources[arr.front[k]];
            }
        }

        for(let k=0; k<arr.back.length; k++){
            var node = this.back[k]
            if(node.y >= 1280){
                node.getComponent(cc.Sprite).spriteFrame = this.resources[arr.back[k]];
            }else {
                node.nextSf = this.resources[arr.back[k]];
            }
        }
    },

    changeSpeed(data){
        this.speed=data?6:1.5;
    },

    gameUpdate(dt){
        this.speed= 1.5 * dt / 0.016
        for(var i=0; i<this.back.length; i++){
            let child = this.back[i]
            child.y -= this.speed;
            if(child.y < -cc.winSize.height){
                child.y += this.back.length * 1280 
                if(child.nextSf){
                    child.getComponent(cc.Sprite).spriteFrame = child.nextSf;
                    child.nextSf = null;
                }
            }
        }
        for(var i=0; i<this.front.length; i++){
            let child = this.front[i]
            child.y -= this.speed*1.5;
            if(child.y < -cc.winSize.height){
                child.y += this.front.length * 1280 
                if(child.nextSf){
                    child.getComponent(cc.Sprite).spriteFrame = child.nextSf;
                    child.nextSf = null;
                }
            }
        }
        
        for(var i=0; i<this.front1.length; i++){
            let child = this.front1[i]
            child.y -= this.speed*2;
            if(child.y < -cc.winSize.height){
                child.y += this.front1.length * 1280 
                if(child.nextSf){
                    child.getComponent(cc.Sprite).spriteFrame = child.nextSf;
                    child.nextSf = null;
                }
            }
        }
    }
});
