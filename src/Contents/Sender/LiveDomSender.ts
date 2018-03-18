import Sender from "../../Base/Container/Sender";


/**
 * 
 */
export default class LiveDomSender extends Sender {

    public static ID = "LiveDom";

    constructor() {
        super(LiveDomSender.ID);
        this.backhtml = "";
        this.fronthtml = "";
    }

    public backhtml: string;
    public fronthtml: string;
}