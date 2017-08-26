import Sender from "../../Base/Container/Sender";
import * as Personal from "../../Base/IndexedDB/Personal";

/**
 * 
 */
export class GetGadgetCastInfoSedner extends Sender {

    public static ID = "GetGadgetCastInfo";

    constructor() {
        super(GetGadgetCastInfoSedner.ID);
    }
}


/**
 * 
 */
export class GadgetCastSettingSender extends Sender {

    public static ID = "GadgetCastSetting";

    constructor() {
        super(GadgetCastSettingSender.ID);
        this.dispUserCursor = false;
        this.guide = null;
    }
    dispUserCursor: boolean;
    guide: Personal.Guide;
}