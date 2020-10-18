export class Util {
    public static lerp(from: number, to: number, per: number): number {
        return from * (1 - per) + to * per;
    }
}