
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
            let lst = this.emitterNode.doWork();
            for (let i = 0, cnt = lst.length; i < cnt; i++) {
                this.bulletCon.addChild(lst[i]);
            }
        }
    }
}
