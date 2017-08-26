import Sender from "../../Base/Container/Sender";
import * as Personal from "../../Base/IndexedDB/Personal";
import { YouTubeOption } from "../../Base/Util/YouTubeUtil";

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


/**
 * 
 */
export class GetYouTubeStatusSender extends Sender {

    public static ID = "GetYouTubeStatus";

    constructor() {
        super(GetYouTubeStatusSender.ID);
    }
}


/**
 * 
 */
export class YouTubeStatusSender extends Sender {

    public static ID = "YouTubeStatus";

    constructor() {
        super(YouTubeStatusSender.ID);

        this.state = -1;
        this.current = -1;
        this.option = null;
    }

    state: YT.PlayerState;
    current: number;
    option: YouTubeOption;
}