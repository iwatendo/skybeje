import Sender from "../../Base/Container/Sender";
import IconCursorSender from "./IconCursorSender";

/**
 * 
 */
export default class LiveDomMessageSender extends Sender {

    public static ID = "LiveDomMessage";

    constructor() {
        super(LiveDomMessageSender.ID);
        this.text = "";
        this.peerid = "";
        this.iconCurosr = null;
    }

    public text: string;
    public peerid: string;
    public iconCurosr: IconCursorSender;

}
