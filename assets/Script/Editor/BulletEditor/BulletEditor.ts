
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import EmitterCom from "./EmitterCom";

const { ccclass, property } = cc._decorator;


@ccclass
export default class BulletEditor extends cc.Component {
    @property(EmitterCom)
    emitterNode: EmitterCom = null;

    @property(cc.Node)
    bulletCon: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}

    start() {

    }

    update(dt) {
        if (this.emitterNode.isWork) {
            let bulletTmp: cc.Node = this.emitterNode.generate();
            this.bulletCon.addChild(bulletTmp);
        }
    }
}
