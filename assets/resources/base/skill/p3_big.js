

cc.Class({
    extends: require('Bullet'),

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.x=global.GameLoop.GameMgr.getPlayer().node.x;
        this.node.y=-720
        this._super()
        this.turn=0;
    },

    start () {
        this._super();
    },

    setOptions(skillbase){
        this._super(skillbase);
        if(skillbase.dir){
            this.dir=skillbase.dir
        }
    },
    update(dt){
        if(this.dir==1){
            if(this.node.x<=360 && this.turn==0){
                this.node.x+=8;
                if(this.node.x>=360 && this.turn==0){
                    this.turn=1
                }
            }else if(this.node.x>=-360 && this.turn==1){
                this.node.x-=8;
                if(this.node.x<=-360 && this.turn==1){
                    this.node.destroy();
                }
            }
            
        }
        if(this.dir==2){
            if(this.node.x>=-360 && this.turn==0){
                this.node.x-=8;
                if(this.node.x<=-360 && this.turn==0){
                    this.turn=1
                }
            }else if(this.node.x<=360 && this.turn==1){
                this.node.x+=8;
                if(this.node.x>=360 && this.turn==1){
                    this.node.destroy();
                }
            }
            
        }
    }
    // update (dt) {},
});
