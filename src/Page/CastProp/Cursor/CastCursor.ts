/**
 * ライブキャスト上に表示するカーソル情報
 */
export default class CastCursor {

    /**
     * @param peerid 
     * @param aid 
     * @param iid 
     * @param name 
     * @param x 
     * @param y 
     * @param isDisp
     */
    constructor(peerid: string, aid: string, iid: string, name: string, x: number, y: number, isDisp: boolean) {
        this.peerid = peerid;
        this.aid = aid;
        this.iid = iid;
        this.name = name;
        this.posX = x;
        this.posY = y;
        this.isDisp = isDisp;
    }

    peerid: string = "";
    aid: string = "";
    iid: string = "";
    posX: number = 0;
    posY: number = 0;
    name: string = null;
    isDisp: boolean = false;
}
