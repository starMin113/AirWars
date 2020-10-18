import { EBattleLayer } from "../../Enums/EBattleLayer";
import { EEventType } from "../../Enums/EEventType";
import { Util } from "../../Game/Mix/Util";
import EmitterCom from "./EmitterCom";

class BulletEvent {
    private bulletCom: BulletCom;
    private startFrame: number;
    private finishFrame: number
    private condition: number;
    private eventType: number;
    private eventId: number;
    private interval: number;
    private changeType: number;
    private begin: number;
    private end: number;
    private add: number;
    constructor(bullet: BulletCom, rawJson: any) {
        this.bulletCom = bullet;
        let dataJson = rawJson.json;
        this.startFrame = parseInt(dataJson.frameIdx);
        this.condition = dataJson.condition;
        this.eventId = dataJson.eventId;
        this.eventType = parseInt(dataJson.eventType);
        let duration = parseInt(dataJson.duration);
        if (this.condition === 1) {
            this.finishFrame = this.startFrame + duration;
        } else if (this.condition === -1) {
            this.finishFrame = this.startFrame;
            this.startFrame -= duration;
        } else if (this.condition === 0) {
            this.finishFrame = this.startFrame;
        }

        this.changeType = parseInt(dataJson.changeType);
        this.interval = parseInt(dataJson.interval);
        let addVal = parseInt(dataJson.addVal);
        if (this.changeType == 1 || this.changeType == 2) {
            this.begin = this.getBegin(this.eventType);
            this.end = addVal;
        }
        else if (this.changeType == 3) {
            this.add = addVal;
        }

    }

    private getBegin(eventType: number): number {
        let begin: number = 0;
        switch (eventType) {
            case EEventType.Speed: begin = this.bulletCom.speed; break;
            case EEventType.SpeedDir: begin = this.bulletCom.speed_dir; break;
            case EEventType.Acr: begin = this.bulletCom.acc; break;
            case EEventType.BulletSpeedDir: begin = this.bulletCom.acc_dir; break;
        }
        return begin;
    }
    public update(): void {
        let currFrameIdx = this.bulletCom.currIdx;
        let per = (currFrameIdx - this.startFrame) / (this.finishFrame - this.startFrame);
        if (currFrameIdx >= this.startFrame && currFrameIdx <= this.finishFrame) {
            if (this.changeType == 1) {
                cc.log("per:"+per);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            else if (this.changeType == 2) {
                let sinVal = Math.sin(per*(Math.PI / 2));
                cc.log("sinVal:"+sinVal);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            if (this.changeType == 3) {
                this.updateProper3();
            }

        }
    }

    private updateProper3(): void {
        if (this.eventType == EEventType.BulletSpeed) {
            this.bulletCom.speed += this.add;
        }
        else if (this.eventType == EEventType.BulletAcr) {
            this.bulletCom.acc += this.add;
        }
        else if (this.eventType == EEventType.BulletAcrDir) {
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
        else if (this.eventType == EEventType.BulletAcr) {
            this.bulletCom.acc = val;;
        }
        else if (this.eventType == EEventType.BulletAcrDir) {
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
export class BulletCom extends cc.Component {

    @property
    public speed: number = 0;

    @property
    public acc: number = 0;

    @property
    public acc_dir: number = 0;

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

    @property(cc.JsonAsset)
    events: any[] = [];

    private currFrameIdx: number = 0;
    private velocity: cc.Vec2 = cc.Vec2.ZERO;
    private eventlist: BulletEvent[];
    public emitter: EmitterCom;
    public lifeCycle: number;
    public speed_dir: number = 0;


    public get currIdx() {
        return this.currFrameIdx;
    }
    onLoad() {
        this.eventlist = [];
        for (let i = 0, len = this.events.length; i < len; i++) {
            this.eventlist.push(new BulletEvent(this, this.events[i]));
        }
    }
    update(dt) {
        this.currFrameIdx++;
        for (let i = 0, len = this.eventlist.length; i < len; i++) {
            this.eventlist[i].update();
        }
        //cc.log("angle:" + this.speed_dir);
        this.node.angle = this.speed_dir;
        let acc: cc.Vec2 = this.toDir(this.acc, this.acc_dir);
        let speed_vec2: cc.Vec2 = this.toDir(this.speed, this.speed_dir);
        speed_vec2 = speed_vec2.add(acc);
        this.node.x += speed_vec2.x;
        this.node.y += speed_vec2.y;
        // this.printVec2("velocity", speed_vec2);
        if (this.currFrameIdx >= this.endFrameIdx) {
            this.node.removeFromParent();
            return;
        }
        this.speed = speed_vec2.mag();
    }

    printVec2(tag: string, v2: cc.Vec2): void {
        cc.log(tag + "x: " + v2.x + "y：" + v2.y);
    }

    onDestroy() {
        for (let i = 0, len = this.eventlist.length; i < len; i++) {
            this.eventlist[i] = null;
            this.events[i] = null;
        }
        this.events = null;
        this.eventlist = null;
    }

    public run(emmiter: EmitterCom) {
        this.node.x = emmiter.node.x;
        this.node.y = emmiter.node.y;
        //   this.acc = cc.v2(0.01, 0.01);
        // this.node.angle=dir.signAngle(cc.Vec2.ZERO);
        let degree = 10;
        this.node.angle = degree;

    }

    private toDir(mag: number, degree: number): cc.Vec2 {
        let angle = degree / 180 * Math.PI;
        let x = Math.cos(angle) * mag;
        let y = Math.sin(angle) * mag;
        return cc.v2(x, y);
    }
}