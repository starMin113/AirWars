
function Pool(name,params){
    this.name = name;
    this.params = params
    this.pool = new cc.NodePool(name);
}

Pool.prototype.preload = function(num){
    for(var i=0; i<num; i++){
        var node =null;
        if(this.params instanceof cc.Prefab){
            node = cc.instantiate(this.params)
        } else if(this.params instanceof cc.SpriteFrame){
            node = new cc.Node();
            node.addComponent(cc.Sprite).sprite = this.params;
        }
        this.pool.put(node)
    }
}

Pool.prototype.get = function(){
    if(this.pool.size() <= 0){
        this.preload(1);
    }
    return this.pool.get();
}
Pool.prototype.put = function(node){
    this.pool.put(node)
}

Pool.prototype.clear = function(node){
    this.pool.clear()
}

module.exports = {
    names : {},
    //params 可以为prefab可spriteFrame
    preload(name,params,num=10){
        if(this.names[name]){
            return;
        }
        var pool = new Pool(name,params);
        this.names[name] = pool;
        pool.preload(num);
        return pool;
    },
    get(name,parent,source){
        if(!this.names[name]){
            cc.error('没有初始化对象池')
            return null;
        }
        var node = this.names[name].get();
        if(!node){
            cc.warn('');
            node = this.names[name].get();
        }
        parent.addChild(node);
        node._source = source;
        return node
    },
    put(name,node){
        if(!this.names[name]){
            cc.error('没有初始化对象池')
            return null;
        }
        this.names[name].put(node);
    },
    clean(name){
        if(name){
            var pool = this.names[name];
            pool.clear();
            return
        }
        for(var key in this.names){
            var pool = this.names[key];
            pool.clear();
        }
    }
}