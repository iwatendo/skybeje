import Sender from "../../Base/Container/Sender";

/**
 * LiveDom情報要求
 */
export default class GetLiveDomSender extends Sender {

    public static ID = "GetLiveDom";

    constructor() {
        super(GetLiveDomSender.ID);
    }

}