
var getAutoNumber = 0;

cc.Class({
    extends: cc.Component,
    properties: {},
    //显示时自动注册js脚本
    onEnable: function(){
        this.node.js = this;
    },
    httpGet:function(path,route,params,cb,reconnect=true){
        if(this.__xhrs){
            for(var i=0; i<this.__xhrs.length; i++){
                var xhr = this.__xhrs[i];
                if(xhr.route ==route){
                    cc.warn('重复请求')
                    return;
                }
            }
        }
        var self = this;
        var xhr = null;

        var resp = function(err,res){
            if(self.__xhrs){
                var xhrs = self.__xhrs;
                var i=0;
                while(i<xhrs.length){
                    if(xhr.__xhrsId == xhrs[i].__xhrsId){
                        xhrs.splice(i,1);
                    } else {
                        i++
                    }
                }
                if(self.node){
                    cb(err,res);
                }
            }
        }

        var xhr = global.Http.get(path,route,params,resp,reconnect);

        if(this.__xhrs == null){
            this.__xhrs = [];
        }
        this.__xhrs.push(xhr);
        xhr.__xhrsId = this.__xhrs.length
    },
    _onPreDestroy(){
        if(this.__xhrs){
            for(var i=0; i<this.__xhrs.length; i++){
                var xhr = this.__xhrs[i]
                xhr['abort'] && xhr.abort();
            }
            delete this.__xhrs
        }
        this._super();
    }

});
