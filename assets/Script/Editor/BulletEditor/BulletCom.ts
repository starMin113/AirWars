import { EBattleLayer } from "../../Enums/EBattleLayer";
import EmitterCom from "./EmitterCom";

const { ccclass, property } = cc._decorator;

@ccclass
export class BulletCom extends cc.Component {

    @property
    speed: number = 0;
    
    @property
    acc: cc.Vec2 = cc.Vec2.ZERO;

    @property
    endFrameIdx: number = 0;

    @property
    opaque:boolean=false;
    @property
    outOfScreenDel=false;

    @property
    scaleX:number=0;
    
    @property
    scaleY:number=0;

    @property({type:cc.Enum(EBattleLayer)})
    layer:EBattleLayer=EBattleLayer.Main

    @property(cc.Prefab)
    boomEffect: cc.Prefab;

    @property([cc.RawAsset])
    events:cc.RawAsset[];

    private currFrameIdx: number = 0;
    private velocity: cc.Vec2;
    public emitter: EmitterCom;
    update(dt) {
        this.currFrameIdx++;
        if (this.currFrameIdx >= this.endFrameIdx) {
            this.node.removeFromParent();
            return;
        }
        this.velocity = this.velocity.add(this.acc);
        this.node.x += this.velocity.x;
        this.node.y += this.velocity.x;
    }

    public di(emmiter: EmitterCom) {
        this.velocity = cc.v2(1, 1).mul(this.speed);
        this.acc = cc.v2(0.01, 0.01);
    }
}