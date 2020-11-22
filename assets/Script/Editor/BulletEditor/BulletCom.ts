import { EBattleLayer } from "../../Enums/EBattleLayer";
import { EChangeType } from "../../Enums/EChangeType";
import { EEventType } from "../../Enums/EEventType";
import { Util } from "../../Game/Mix/Util";
import EmitterEditorCom from "./EmitterCom";
import { PropCom, PropEvent } from "./PropCom";

class BulletEvent extends PropEvent {
    private bulletCom: BulletCom;
    private startFrame: number;
    private finishFrame: number
    private condition: number;
    private eventType: string;
    private eventId: number;
    private interval: number;
    private changeType: string;
    private begin: number;
    private end: number;
    private add: number;
    constructor(bullet: BulletCom, rawJson: any) {
        super();
        this.bulletCom = bullet;
        let dataJson = rawJson.json;
        this.startFrame = parseInt(dataJson.frameIdx);
        this.condition = dataJson.condition;
        this.eventId = dataJson.eventId;
        this.eventType =(dataJson.eventType);
        let duration = parseInt(dataJson.duration);
        if (this.condition === 1) {
            this.finishFrame = this.startFrame + duration;
        } else if (this.condition === -1) {
            this.finishFrame = this.startFrame;
            this.startFrame -= duration;
        } else if (this.condition === 0) {
            this.finishFrame = this.startFrame;
        }

        this.changeType = (dataJson.changeType);
        this.interval = parseInt(dataJson.interval);
        let addVal = parseInt(dataJson.addVal);
        if (this.changeType == EChangeType.LinerTo || this.changeType == EChangeType.SinTo) {
            this.end = addVal;
        }
        else if (this.changeType == EChangeType.Liner) {
            this.add = addVal;
        }

    }

    private getBegin(eventType: string): number {
        let begin: number = 0;
        switch (eventType) {
            case EEventType.BulletSpeed: begin = this.bulletCom.speed; break;
            case EEventType.BulletSpeedDir: begin = this.bulletCom.speed_dir; break;
            case EEventType.BulletAcc: begin = this.bulletCom.acc; break;
            case EEventType.BulletSpeedDir: begin = this.bulletCom.acc_dir; break;
        }
        return begin;
    }
    public update(): void {
        let currFrameIdx = this.bulletCom.currIdx;
        let per = (currFrameIdx - this.startFrame) / (this.finishFrame - this.startFrame);
        if (currFrameIdx == this.startFrame) {
            this.begin = this.getBegin(this.eventType);
        }
        if (currFrameIdx >= this.startFrame && currFrameIdx <= this.finishFrame) {
            if (this.changeType == EChangeType.LinerTo) {
                // cc.log("per:"+per);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            else if (this.changeType == EChangeType.SinTo) {
                let sinVal = Math.sin(per * (Math.PI / 2));
                //  cc.log("sinVal:"+sinVal);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            if (this.changeType == EChangeType.Liner) {
                this.updateProper3();
            }

        }
    }

    private updateProper3(): void {
        if (this.eventType == EEventType.BulletSpeed) {
            this.bulletCom.speed += this.add;
        }
        else if (this.eventType == EEventType.BulletAcc) {
            this.bulletCom.acc += this.add;
        }
        else if (this.eventType == EEventType.BulletAccDir) {
            this.bulletCom.acc_dir += this.add;
        }
        else if (this.eventType == EEventType.BulletSpeedDir) {
            this.bulletCom.speed_dir += this.add;
        }
        else if (this.eventType == EEventType.LifeCycle) {

        }
        else if (this.eventType == EEventType.GreenColor) {

        }
    }

    private updateProper1or2(val): void {
        if (this.eventType == EEventType.BulletSpeed) {
            this.bulletCom.speed = val;
        }
        else if (this.eventType == EEventType.BulletAcc) {
            this.bulletCom.acc = val;;
        }
        else if (this.eventType == EEventType.BulletAccDir) {
            this.bulletCom.acc_dir = val;;
        }
        else if (this.eventType == EEventType.BulletSpeedDir) {
            this.bulletCom.speed_dir = val;;
        }
        else if (this.eventType == EEventType.LifeCycle) {

        }
        else if (this.eventType == EEventType.GreenColor) {

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
export class BulletCom extends PropCom {
    @property
    public speed: number = 0;

    @property
    public acc: number = 0;

    @property
    public acc_dir: number = 0;

    @property(cc.JsonAsset)
    events: any[] = [];
    
    @property
    endFrameIdx: number = 0;

    @property
    opaque: boolean = false;
    @property
    outOfScreenDel = false;

    @property
    reback_times: number = 0;

    @property
    scaleX: number = 0;

    @property
    scaleY: number = 0;

    @property({ type: cc.Enum(EBattleLayer) })
    layer: EBattleLayer = EBattleLayer.Main

    @property(cc.Prefab)
    boomEffect: cc.Prefab;
    public emitter: EmitterEditorCom;
    public lifeCycle: number;

    onLoad() {
        this.eventlist = [];
        for (let i = 0, len = this.events.length; i < len; i++) {
            this.eventlist.push(new BulletEvent(this, this.events[i]));
        }
    }

    onDestroy() {
        for (let i = 0, len = this.eventlist.length; i < len; i++) {
            this.eventlist[i] = null;
            this.events[i] = null;
        }
        this.events = null;
        this.eventlist = null;
    }

    public run(emmiter: EmitterEditorCom, beginPos: cc.Vec2, dir: number) {
        this.node.setPosition(beginPos);
        //   this.acc = cc.v2(0.01, 0.01);
        // this.node.angle=dir.signAngle(cc.Vec2.ZERO);
        this.speed_dir = dir;
        this.node.angle = this.speed_dir;

    }


}