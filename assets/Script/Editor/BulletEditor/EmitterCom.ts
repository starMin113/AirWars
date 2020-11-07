// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html

import { EEventType } from "../../Enums/EEventType";
import { Util } from "../../Game/Mix/Util";
import { BulletCom } from "./BulletCom";
import { PropCom, PropEvent } from "./PropCom";

class EmitterEvent extends PropEvent {
    private emitterCom: EmitterCom;
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
    constructor(bullet: EmitterCom, rawJson: any) {
        super();
        this.emitterCom = bullet;
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
            this.end = addVal;
        }
        else if (this.changeType == 3) {
            this.add = addVal;
        }

    }

    private getBegin(eventType: number): number {
        let begin: number = 0;
        switch (eventType) {
            case EEventType.BulletSpeed: begin = this.emitterCom.speed; break;
            case EEventType.BulletSpeedDir: begin = this.emitterCom.speed_dir; break;
            case EEventType.BulletAcr: begin = this.emitterCom.acc; break;
            case EEventType.BulletSpeedDir: begin = this.emitterCom.acc_dir; break;
        }
        return begin;
    }
    public update(): void {
        let currFrameIdx = this.emitterCom.currIdx;
        let per = (currFrameIdx - this.startFrame) / (this.finishFrame - this.startFrame);
        if (currFrameIdx == this.startFrame) {
            this.begin = this.getBegin(this.eventType);
        }
        if (currFrameIdx >= this.startFrame && currFrameIdx <= this.finishFrame) {
            if (this.changeType == 1) {
                // cc.log("per:"+per);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            else if (this.changeType == 2) {
                let sinVal = Math.sin(per * (Math.PI / 2));
                //  cc.log("sinVal:"+sinVal);
                this.updateProper1or2(Util.lerp(this.begin, this.end, per));
            }
            if (this.changeType == 3) {
                this.updateProper3();
            }

        }
    }

    private updateProper3(): void {
        if (this.eventType == EEventType.BulletSpeed) {
            this.emitterCom.speed += this.add;
        }
        else if (this.eventType == EEventType.BulletAcr) {
            this.emitterCom.acc += this.add;
        }
        else if (this.eventType == EEventType.BulletAcrDir) {
            this.emitterCom.acc_dir += this.add;
        }
        else if (this.eventType == EEventType.BulletSpeedDir) {
            this.emitterCom.speed_dir += this.add;
        }
        else if (this.eventType == EEventType.LifeCycle) {

        }
        else if (this.eventType == EEventType.GreenColor) {

        }
    }

    private updateProper1or2(val): void {
        if (this.eventType == EEventType.BulletSpeed) {
            this.emitterCom.speed = val;
        }
        else if (this.eventType == EEventType.BulletAcr) {
            this.emitterCom.acc = val;;
        }
        else if (this.eventType == EEventType.BulletAcrDir) {
            this.emitterCom.acc_dir = val;;
        }
        else if (this.eventType == EEventType.BulletSpeedDir) {
            this.emitterCom.speed_dir = val;;
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
export default class EmitterCom extends PropCom {
    @property
    startIdx: number = 0;
    @property
    pauseIdx: number = 0;
    @property
    resumeIdx: number = 0;
    @property
    lifeCyle: string = "";
    @property
    is_bind: boolean = false;
    @property
    dirDegree: number = 0;
    @property
    spread: number = 0;
    @property
    spread_rotate = 0;
    @property
    count: number = 0;
    @property
    interval: number = 0;
    @property
    init_dir: number = 0;
    @property
    range: number = 360;
    @property
    axis: number = 0;

    @property(cc.Prefab)
    bullet_prefab: cc.Prefab;

    @property(cc.JsonAsset)
    events: any[] = [];

    public isWork: boolean = false;
    private _lastCreateIdx: number = 0;

    private readonly staticPos: cc.Vec2 = cc.Vec2.ZERO
    public doWork(): cc.Node[] {
        let lst: cc.Node[] = [];
        if (!this.isWork) return lst;
        if ((this._currIdx - this._lastCreateIdx) < this.interval) return lst;
        let center: cc.Vec2 = this.is_bind ? this.node.getPosition() : this.staticPos;
        // let deltaRad: number = 2 * Math.PI / this.count;
        // let deltaDegree:number=this.rangeDir/this.count;
        // for (let i = 0; i < this.count; i++) {
        //     let rad:number = i * deltaRad;
        //     let y:number = Math.sin(rad) * this.spread;
        //     let x:number= Math.cos(rad) * this.spread;
        //     let dot:cc.Vec2= cc.v2(x, y);
        //     dot = center.add(dot);
        //     let bulletNode = cc.instantiate(this.bullet_prefab);
        //     let bulletCom = bulletNode.getComponent(BulletCom);
        //     bulletCom.run(this, dot,deltaDegree*i+this.init_dir);
        //     lst.push(bulletNode);
        // }
        //let deltaRad: number = 2 * Math.PI / this.count;
        let deltaDegree: number = this.range > 0 ? (this.range / (this.count + 1)) : (360 / this.count);
        let beginDegree: number = this.range > 0 ? (this.axis - this.range / 2) : 0;
        cc.log("deltaD" + deltaDegree + "beginD" + beginDegree);
        for (let i = 0; i < this.count; i++) {
            let degree: number = beginDegree + this.range > 0 ? ((i + 1) * deltaDegree) : (i * deltaDegree);
            cc.log("degree:" + degree);
            let rad = (degree * Math.PI) / 180;
            let y: number = Math.sin(rad) * this.spread;
            let x: number = Math.cos(rad) * this.spread;
            let dot: cc.Vec2 = cc.v2(x, y);
            dot = center.add(dot);
            let bulletNode = cc.instantiate(this.bullet_prefab);
            let bulletCom = bulletNode.getComponent(BulletCom);
            bulletCom.run(this, dot, degree + this.init_dir);
            lst.push(bulletNode);
        }
        this._lastCreateIdx = this._currIdx;
        return lst;
    }

    private onCreate() {
        //let dotList: cc.Vec2[] = [];


    }


    onLoad() {
        this.eventlist = [];
        for (let i = 0, len = this.events.length; i < len; i++) {
            this.eventlist.push(new EmitterEvent(this, this.events[i]));
        }
    }


    update(dt) {
        super.update(dt);
        if (this._currIdx % this.startIdx == 0) {
            this.isWork = true;
        }
        if (this._currIdx % this.pauseIdx == 0) {
            this.isWork = false;
        }
        if (this._currIdx % this.resumeIdx == 0) {
            this.isWork = true;
        }

    }
}
