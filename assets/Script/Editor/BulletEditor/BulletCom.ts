import { EBattleLayer } from "../../Enums/EBattleLayer";
import { EEventType } from "../../Enums/EEventType";
import EmitterCom from "./EmitterCom";

class BulletEvent{
    private bulletCom:BulletCom;
    private startFrame:number;
    private finishFrame:number
    private condition:number;
    private eventType:number;
    private eventId:number;
    private interval:number;
    private addValFrame:number;
    constructor(bullet:BulletCom,rawJson:any){
        this.bulletCom=bullet;
        let dataJson=rawJson.json;
        this.startFrame=parseInt(dataJson.frameIdx);
        this.condition=dataJson.condition;
        this.eventId=dataJson.eventId;
        this.eventType=parseInt(dataJson.eventType);
         let duration=parseInt(dataJson.duration);
         if(this.condition===1){
             this.finishFrame=this.startFrame+duration;
         }else if(this.condition===-1){
            this.finishFrame=this.startFrame;
            this.startFrame-=duration;
         }else if(this.condition===0){
             this.finishFrame=this.startFrame;
         }
         
        let changeType=parseInt(dataJson.changeType);
        this.interval=parseInt(dataJson.interval);
        let addVal=parseInt(dataJson.addVal);
        if(changeType==1||changeType==2){
            this.addValFrame=this.logicFrameAdd(addVal,duration,this.eventType);
        }
        else{

        }
        
    }

    private logicFrameAdd(finalVal:number,duration:number,eventType:number):number{
        let addFrameTemp:number=0;
        switch(eventType){
            case EEventType.Speed:
                break;
            case EEventType.SpeedDir:break;
            case EEventType.Acr:break;
        }
        return addFrameTemp;
    }
    public update():void{
        let currFrameIdx=this.bulletCom.currIdx;
        if(currFrameIdx>=this.startFrame&&currFrameIdx<=this.finishFrame){
        
        }
    }

    private updateProper():void{
        if(this.eventType==EEventType.Speed){
            this.bulletCom.speed+=this.addValFrame;
        }
        else if(this.eventType==EEventType.Acr){
            this.bulletCom.acc+=this.addValFrame;
        }
        else if(this.eventType==EEventType.AcrDir){
            this.bulletCom.acc_dir+=this.addValFrame;
        }
        else if(this.eventType==EEventType.SpeedDir){
            this.bulletCom.speed_dir+=this.addValFrame;
        }
        else if(this.eventType==EEventType.LifeCycle){
        
        }
        else if(this.eventType==EEventType.GreenColor){

        }
    }

    // private checkPlus():boolean{
    //     return this.condition===1&&this.bulletCom.currIdx>this.;
    // }

    // private checkMinus():boolean{
    //     return this.condition===0&&this.bulletCom.currIdx<this.frameIdx;
    // }

    // private checkEquals():boolean{
    //     return this.condition===-1&&this.bulletCom.currIdx===this.frameIdx;
    // }
}

const { ccclass, property } = cc._decorator;
@ccclass
export class BulletCom extends cc.Component {

    @property
    public speed: number = 0;
    
    @property
    public acc:number=0;

    @property
    public acc_dir:number=0;

    @property
    endFrameIdx: number = 0;

    @property
    opaque:boolean=false;
    @property
    outOfScreenDel=false;

    @property
    reback_times:number=0;

    @property
    scaleX:number=0;
    
    @property
    scaleY:number=0;

    @property({type:cc.Enum(EBattleLayer)})
    layer:EBattleLayer=EBattleLayer.Main

    @property(cc.Prefab)
    boomEffect: cc.Prefab;

    @property
    events:any;
    
    private currFrameIdx: number = 0;
    private velocity: cc.Vec2=cc.Vec2.ZERO;
    private eventlist:BulletEvent[];
    public emitter: EmitterCom;
    public lifeCycle:number;
    public speed_dir:number=0;


    public get currIdx(){
        return this.currFrameIdx;
    }
    onLoad(){
        this.eventlist=[]; 
        for(let i=0,len=this.events.length;i<len;i++){
            this.eventlist.push(new BulletEvent(this,this.events[i]));
        }
    }
    update(dt) {
        this.currFrameIdx++;  
        for(let i=0,len=this.eventlist.length;i<len;i++){
           // this.eventlist[i].update();
        }
        this.node.angle=this.speed_dir;
        let acc:cc.Vec2=this.toDir(this.acc,this.acc_dir);
        let speed_vec2:cc.Vec2=this.toDir(this.speed,this.speed_dir);
        this.velocity=this.velocity.add(speed_vec2);
       
        //this.velocity = this.velocity.add(acc);       
        this.node.x += this.velocity.x;
        this.node.y += this.velocity.y; 
        cc.log("velocitx"+this.velocity.x);
        cc.log("velocity"+this.velocity.y);
        if (this.currFrameIdx >= this.endFrameIdx) {
            this.node.removeFromParent();
            cc.log("accx:"+acc.x);
            cc.log("accy:"+acc.y);
                 
            return;
        }
        
    }

    onDestroy(){
        for(let i=0,len=this.eventlist.length;i<len;i++){
            this.eventlist[i]=null;
            this.events[i]=null;
        }
        this.events=null;
        this.eventlist=null;
    }

    public run(emmiter: EmitterCom) {     
        this.node.x=emmiter.node.x;
        this.node.y=emmiter.node.y;
     //   this.acc = cc.v2(0.01, 0.01);
       // this.node.angle=dir.signAngle(cc.Vec2.ZERO);
        let degree=10;
        this.node.angle=degree;
        
    }

    private toDir(mag:number,degree:number):cc.Vec2{
        let angle=degree/180*Math.PI;
        let x=Math.sin(angle)*mag;
        let y=Math.cos(angle)*mag;
        return cc.v2(x,y);
    }
}