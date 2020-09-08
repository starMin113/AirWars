var resources = {};
var resourcesGroup = {};
var jsonGroup = {};

module.exports = {
    init:function(){
        resources = {};
        resourcesGroup = {};
        jsonGroup = {};
    },

    //加载资源
    loadResources: function (groupName, completeCallback, progressCallback) {
        if(!resourcesGroup[groupName]){
            this.loadResourcesArray(global.Resources[groupName], function(assets){
                resourcesGroup[groupName] = assets
                completeCallback(assets)
            }, progressCallback);
        } else {
            completeCallback(resourcesGroup[groupName])
        }
    },
    loadResourcesArray: function (urls, completeCallback, progressCallback) {
        //let loadding = cc.find('Canvas/Loadding');
       // let progre = cc.find('UI-ProgressBar', loadding)
       // loadding.active = true;
        //progre.js.setPercent(0);
        cc.loader.loadResArray(urls, (OKCount, sumCount) => {
            var p = (OKCount / sumCount).toFixed(2)
            // if(p > progre.js.getPercent()){
            //     progre.js.setPercent(OKCount / sumCount);
            // }
            progressCallback&&progressCallback(OKCount, sumCount)
        }, (error, assets) => {
            if (!error) {
                for (let i = 0; i < assets.length; i++) {
                    resources[urls[i]] = assets[i];
                }
                // cc.find('Canvas/Mask').active = false;
                //loadding.active = false;
                completeCallback(assets);
            } else {
                
                cc.error(error);
                cc.error('加载资源组失败，两秒后重试！');
                setTimeout(() => {
                    this.loadResourcesArray(urls, completeCallback, progressCallback);
                }, 2000);
            }
        });
    },
    releaseResources(groupName){
        if(resourcesGroup[groupName]){
            for(var i=0; i<global.Resources[groupName].length; i++){
                var n = global.Resources[groupName][i]
                cc.loader.releaseRes(n,cc.Prefab)
                resources[n] = null;
            }
        }
        resourcesGroup[groupName] = null
    },
    addPrefab(url,prefab){
        if(!url || !prefab){
            cc.warn('空对象不能添加')
            return;
        }
        resources[url] = prefab
    },
    get: function (url) {
        if (!resources[url]) {
            cc.error('您必须先加载这个资源', url);
        }
        return resources[url];
    },
    getInstantiate: function (url) {
        return cc.instantiate(this.get(url));
    },
    addPrefabToCanvas: function (url, parent = cc.find('Canvas'), pos = { x: 0, y: 0 }) {
        let p = this.getInstantiate(url);
        p.x = pos.x;
        p.y = pos.y;
        parent.addChild(p);
        return p;
    },
    loaderScene: function (name,onlyChild = true) {
        let mainScene = cc.find('Canvas/Main');
        this._loaderPrefab(name,mainScene,onlyChild)
        cc.log('======>>跳转场景:' + name);
    }
    
}