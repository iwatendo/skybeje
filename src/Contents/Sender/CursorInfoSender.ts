import Sender from "../../Base/Container/Sender";

export default class CursorInfoSender extends Sender {

    public static ID = "CursorInfo";

    constructor() {
        super(CursorInfoSender.ID);
        this.peerid = "";
        this.aid = "";
        this.iid = "";
        this.isDispChange = false;
    }

    peerid: string;
    aid: string;
    iid: string;
    isDispChange: boolean;
}