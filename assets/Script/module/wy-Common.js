

module.exports = {
    formatDate :function (date,fmt) { //author: meizz 
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },

    getClassName(_class){
        return target.name.substring(target.name.indexOf('<')+1,target.name.indexOf('>'));
    },

    addSingleButton(node,type){
        var c = node.getComponent(type);
        if(!c){
            c = node.addComponent(type);
            c.transition = cc.Button.Transition.SCALE
        }
        return c;
    },

    /*
    * target 方法的执行有者(一般是this)
    * btnNode 按钮的node，或者是button
    * func 为回调方法 string类型
    * tag 标识符 string类型
    */
    addButtonHandler(target,btnNode,func,tag){
        if(!target){
            console.warn('没有节点怎么添加触摸')
            return;
        }
        var name = target.name.substring(target.name.indexOf('<')+1,target.name.indexOf('>'));
        var handler = new cc.Component.EventHandler();
        handler.target = target;
        handler.component = name;
        handler.handler = func;
        handler.customEventData = tag;
        var button = btnNode instanceof cc.Button ? btnNode :  this.addSingleButton(btnNode,cc.Button);
        button.clickEvents.push(handler)
        return button
    },
    //按长度分隔字符串
    subSectionString(text,cutlen){
        var id = 0;
        var str = '' 
        var len = 0;
        for (var i=0; i<text.length; i++) {    
            var c = text.charCodeAt(i);
            if (c>127 || c==94) {    
                len += 2;    
            } else {    
                len ++;    
            }
            if(len>cutlen) {
                str += text.substring(id,i)+'\n';
                len = 0;
                id = i;
            }
        } 
        str += text.substring(id,text.length);
        return str;
    },
    arrayFindObject(arr,obj){
        for(var i=0; i<arr.length; i++){
            var a = arr[i];
            var b = true
            for(var k in obj){
                if(obj[k] != a[k]){
                    b = false;
                    break;
                }
            }
            if(b){
                return i;
            }
        }
        return -1
    },
    arrayMatchObject(arr,obj){
        for(var i=0; i<arr.length; i++){
            var a = arr[i];
            var b = true
            for(var k in obj){
                if(obj[k] != a[k]){
                    b = false;
                    break;
                }
            }
            if(b){
                return a;
            }
        }
        return null
    },
    isNumber(v){
        var b = parseInt(v)
        return b === 0 || b;
    },
    clamp(min,max,n){
        return Math.max(min, Math.min(max, n))
    },
    /**
     * 
     * @param {*} 原生参数
     * @param {*} 需要拷贝的对象
     */
    deepCopy (o, c) {
        if(o == undefined || o == null){
            return null;
        }
        c = c || {}
        for (let i in o) {
          if (o[i] && typeof o[i] === 'object') {
            if (o[i].constructor === Array) {
              c[i] = []
            } else {
              c[i] = {}
            }
            this.deepCopy(o[i], c[i])
          } else {
            c[i] = o[i]
          }
        }
        return c
    },
    //读取带注释的json字符串
    readJson(d){
        if(typeof d.json == 'object'){
            return d.json;
        }
        var data = d.text;
        if(!data){
            cc.warn('没有数据啊:',data);
            return null
        }
        var str = '';
        var last = 0;
        while(true){
            var s = data.substring(0,last+1);
            var c = data.indexOf('//',last);
            var c1 = data.indexOf('/*',last);
            var m = 0
            if(c>=0){
                if(c1>=0){
                    m = Math.min(c,c1);
                } else {
                    m = c;
                }
            } else if(c1>=0){
                m = c1;
            } else {
                str+=data.substring(last)
                break;
            }
            if(m == c){
                var d = data.indexOf('\n',c+2);
                str+=data.substring(last,c)
                last = d+2;
            } else if(m == c1){
                var d = data.indexOf('*/',c1+2);
                str+=data.substring(last,c1)
                last = d+2;
            }
        }
        try{
            let v = JSON.parse(str);
            return v;
        } catch(e){
            console.error('json parseerror:',err,str);
            return null;
        }
    },
    removeArrayObj(arr,obj,count=1,start=0){
        var c = 0;
        var i=start;
        while(i<arr.length){
            if(obj == arr[i]){
                arr.splice(i,1);
                c++;
            }
            i++;
            if(c >= count){
                break;
            }
        }
    },
    getAngle(p1,p2){
        if(p1.x==p2.x){
            return p2.y > p1.y ? Math.PI/2 : -Math.PI
        }
        var a = Math.abs(Math.atan((p2.y-p1.y)/(p2.x-p1.x)))
        return a;
    },
    pointInScreen(x,y){ //检测点是否在场景内
        var p = typeof x == 'object' ? x : cc.v2(x,y)
        if(p.x >= -cc.winSize.width/2 && p.x <= cc.winSize.width/2 && p.y >= -cc.winSize.height/2 && p.y <= cc.winSize.height/2){
            return true
        }
        return false;
    },
    randomInteger(){ //返回 -1 到1
        return Math.random()* 2 -1
    },
    removeChildByName(parent,name){
        if(!parent) return;
        let child = cc.find(name,parent)
        child&&parent.removeChild(child);
    },
    getKV(d){
        if(d < 1000){
            return d;
        }
        var a = d/1000;
        if(d > Math.floor(a)*1000){
            return a.toFixed(1)+'k'
        } else {
            return a+'k'
        }
    },
    calcDetailDay(time1,time2){
        var startTime = new Date(time1.getFullYear()+'-'+(time1.getMonth()+1)+'-'+time1.getDate()).getTime();
        var endTime = new Date(time2.getFullYear()+'-'+(time2.getMonth()+1)+'-'+time2.getDate()).getTime();
        return  Math.floor((endTime-startTime)/(3600*1000*24))
    }
}