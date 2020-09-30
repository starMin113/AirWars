// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html

import { BulletCom } from "./BulletCom";


const { ccclass, property } = cc._decorator;

@ccclass
export default class EmitterCom extends cc.Component {
    @property
    text: string = 'hello';
    @property
    startFrameIdx: number = 0;
    @property
    endFrameIdx: number = 0;

    
    @property
    is_bind: boolean = false;
    @property
    speed: number = 0.0;
    @property
    dirDegree: number = 0;

    // LIFE-CYCLE CALLBACKS:

    private prefab: cc.Prefab;
    // onLoad () {}

    public isWork: boolean = false;
    private timespan: number = 0;
    start() {
        this.isWork = false;
        cc.loader.loadRes("Bullet/BulletGreen", cc.Prefab, (error, prefab) => {
            if (error) {

            } else {
                this.prefab = prefab;
                this.isWork = true;
            }
        });
    }


    public generate(): cc.Node {
        if (!this.isWork) return;
        let bulletNode = cc.instantiate(this.prefab);
        let bulletCom = bulletNode.getComponent(BulletCom);
        bulletCom.di(this);
        this.isWork = false;
        return bulletNode;
    }

    update(dt) {
        this.timespan += dt;
        if (this.timespan >= 200) {
            this.timespan = 0;
            this.isWork = true;

        }
    }
}
