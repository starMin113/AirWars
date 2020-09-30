
cc.Class({
    extends: cc.Component,

    properties: {
        particleParent : cc.Node
    },

    onLoad(){
        var chilren = this.particleParent.children;
        
        for(var i=0; i<chilren.length; i++){
            var edit = chilren[i].getComponent('ParticleSystem');
            var no = new cc.Node();
            this.node.addChild(no)
            edit.setParticleLayer(no)
        }
    },

    // LIFE-CYCLE CALLBACKS:

    parseUuidToUrl(uuid){
        let pathToUuid = cc.loader["_resources"]._pathToUuid;
        for (let key in pathToUuid){
            let entrys = pathToUuid[key];
            if (entrys instanceof Array){
                for (let entry of entrys){
                    if (entry.uuid === uuid){
                        return key;
                    }
                }
            }else{
                if ( entrys["uuid"] === uuid){
                    return key;
                }
            }

        }
        return "";
    },

    onConsole(){
        if(!this.particleParent){
            cc.warn('请先配置父类')
            return
        }
        var chilren = this.particleParent.children;
        
        for(var i=0; i<chilren.length; i++){
            var edit = chilren[i].getComponent('ParticleSystemEditor');
            if(edit && chilren[i].active){
                var sp = chilren[i].getComponent('ParticleSystem').particleTexture;
                var data = edit.getData()
                data.spriteFrame = this.parseUuidToUrl(sp._uuid)
                console.log(chilren[i].name,':',JSON.stringify(data))
            }
        }
        
    }

    // update (dt) {},
});
