var ParticlePool = {
    names :{},
    get:function(poolName,parent,name,sf,source){
        var pool = this.names[poolName]
        if(!this.names[poolName]){
            pool = new cc.NodePool();
            this.names[poolName] = pool
        }
        var node = pool.get();
        if(!node){
            // cc.log('create Sprite')
            if(!sf){
                console.warn('没有图片的子弹')
            }
            var sp = new cc.Node().addComponent(cc.Sprite);
            sp.node.sprite = sp.node.addComponent('ParticleSprite')
            sp.spriteFrame = sf;
            node = sp.node
            node.name = name;
            sp.node._source = source
            parent.addChild(sp.node)
            // this.layer ? this.layer.addChild(sp.node) : this.node.addChild(sp.node);
            return node;
        } else {
            node.name = name;
            node._source = source
            parent.addChild(node)
            // this.layer ? this.layer.addChild(node) : this.node.addChild(node);
            return node;
        }
    },
    put:function(name,sprite){
        var pool = this.names[name]
        if(pool){
            sprite._source = null;
            pool.put(sprite)
        }
    },
    clean(){
        for(var key in this.names){
            var pool = this.names[key];
            pool.clear();
        }
        this.names = {}
    }
}

module.exports = ParticlePool