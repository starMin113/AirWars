
const { ccclass, property } = cc._decorator;
export class PropEvent {

    public update(): void {

    }
}
export class PropCom extends cc.Component {
    @property
    public speed: number = 0;

    @property
    public acc: number = 0;

    @property
    public acc_dir: number = 0;

    @property(cc.JsonAsset)
    events: any[] = [];

    protected eventlist: PropEvent[];
    protected _currIdx: number = 0;
    public speed_dir: number = 90;

    public get currIdx() {
        return this._currIdx;
    }

    public update(dt) {
        this._currIdx++;
        this.propUpdate();
    }

    private propUpdate(): void {
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
        //this.printVec2("velocity", speed_vec2);
        if (this.checkToRemove()) {
            this.node.removeFromParent();
            return;
        }
        this.speed = speed_vec2.mag();
    }

    protected printVec2(tag: string, v2: cc.Vec2): void {
        cc.log(tag + "x: " + v2.x + "y：" + v2.y);
    }

    protected checkToRemove(): boolean {
        return false;
    }

    protected toDir(mag: number, degree: number): cc.Vec2 {
        let angle = degree / 180 * Math.PI;
        let x = Math.cos(angle) * mag;
        let y = Math.sin(angle) * mag;
        return cc.v2(x, y);
    }
}