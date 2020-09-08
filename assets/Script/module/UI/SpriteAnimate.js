cc.Class({
    extends: cc.Component,

    properties: {
        Frams : {
            default : [],
            type : cc.SpriteFrame
        },
        autoPlay : false,
        delayTime : 0.15,
        repeat : -1,
        autoRemove : false
    },

    // use this for initialization
    onLoad: function () {
        this.runtime = 0;
        this.isRun = false;
        this.index = -1;
        this.sprite = this.node.getComponent(cc.Sprite);
        this.loadstart();
    },

    start : function(){
       
    },

    loadstart : function(){
        if(this.autoPlay){
            if(this.Frams.length > 0){
                this.startAnimate(this.repeat,()=>{
                    if(this.autoRemove){
                        this.node.destroy();
                    }
                });
            }
        }
    },

    loadFrames : function(atlas,name,begin,end){
        this.loadname = name;
        this.loadBegin = begin;
        this.loadEnd = end;
        this.Frams.splice(0,this.Frams.length);
        for(var i=begin; i<end; i++){
            this.Frams.push(atlas.getSpriteFrame(name+i))
        }
    },

    startAnimate : function(repeat,cb){
        this.endCB = cb
        this.reset();
        this.isRun = true;
        this.repeat = repeat ? repeat :-1
    },

    readFrames : function(){
        // cc.log("readFrames start",this.loadBegin,this.loadEnd,typeof(this.loadBegin));
        for(var i=this.loadBegin; i<this.loadEnd; i++){
            // cc.log("readyFrames ",i,this.framename[i]);
            this.Frams[i] = this.animateHelp.getFrames(this.framename[i]);
        }
        this.startAnimate();
    },

    setDelayTime : function(time){
        this.delayTime = time;
        this.runtime = this.delayTime;
    },

    reset  :function(){
        this.index = -1;
    },

    
    updateFrame : function(){
        // cc.log("SpriteAnimate : ",this.index);
        this.index += 1;
        this.index = this.index % this.Frams.length;
        if(this.index == 0){
            if(this.repeat == 0){
                this.endCB && this.endCB();
                if(this.autoRemove){
                    this.node.destroy();
                }

                // cc.log("updateFrame destroy");
                return;
            }
            if(this.repeat != -1){
                this.repeat -- ;
            }
        }

        this.sprite.spriteFrame = this.Frams[this.index];
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.isRun){
            if(this.runtime < 0 ){
                this.runtime = this.delayTime;
                this.updateFrame();
                // cc.log("SpriteAnimate : update",this.runtime);
                return;
            }
            this.runtime -= dt;
            // 
        }
    },
});
