import Sender from "../../Base/Container/Sender";

/**
 * 
 */
export default class MobileCastSettingSender extends Sender {

    public static ID = "MobileCastSetting";

    constructor() {
        super(MobileCastSettingSender.ID);
        this.isSFU = false;
        this.isDispCursor = false;
        this.isRearCamera = false;
    }

    public isSFU: boolean;
    public isDispCursor: boolean;
    public isRearCamera: boolean;
}
