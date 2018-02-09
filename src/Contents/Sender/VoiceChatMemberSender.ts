import Sender from "../../Base/Container/Sender";

/**
 * 
 */
export default class VoiceChatMemberSender extends Sender {

    public static ID = "VoiceChatMember";

    constructor() {
        super(VoiceChatMemberSender.ID);
        this.peerid = "";
        this.aid = "";
        this.iid = "";
        this.isMember = false;
    }

    public peerid: string;
    public aid: string;
    public iid: string;
    public isMember: boolean;
}
