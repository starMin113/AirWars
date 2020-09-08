

var FrameManager = {
    children:[],
    add(pathReady){
        this.children.push(pathReady)
    },
    remove(pathReady){
        var chd = this.children.findIndex(item=>{return item.uuid == pathReady.uuid})
        if(chd >-1){
            this.children.splice(chd,1);
        }
    },
    gameUpdate(dt){
        for(var i=0; i<this.children.length; i++){
            this.children[i].gameUpdate(dt);
        }
    }
}

module.exports = FrameManager;