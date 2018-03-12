import Sender from "../../Base/Container/Sender";

/**
 * チャットクライアントからサーバント側にチャット情報を送る為のクラス
 */
export default class ChatStatusSender extends Sender {

    public static ID = "CursorInfo";

    constructor() {
        super(ChatStatusSender.ID);
        this.peerid = "";
        this.aid = "";
        this.iid = "";
        this.isDispChange = false;
        this.message = "";
    }

    peerid: string;
    aid: string;
    iid: string;
    isDispChange: boolean;
    message: string;
}