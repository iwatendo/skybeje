import Sender from "../../Base/Container/Sender";
import * as Personal from "../../Base/IndexedDB/Personal";
import { YouTubeOption } from "../../Base/Util/YouTubeUtil";

/**
 * 
 */
export class GetGadgetCastSettingSedner extends Sender {

    public static ID = "GetGadgetCastSetting";

    constructor() {
        super(GetGadgetCastSettingSedner.ID);
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
    status: YouTubeStatusSender;
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

        this.pid = null;
        this.state = -1;
        this.current = -1;
        this.playbackRate = 1;
        this.isSyncing = false;
    }

    pid: string;
    state: YT.PlayerState;
    current: number;
    playbackRate: number;
    isSyncing : boolean;


    /**
     * ステータスの一致確認
     * @param s1 
     * @param s2 
     */
    public static IsEqual(s1: YouTubeStatusSender, s2: YouTubeStatusSender) {
        if (s1.state !== s2.state) return false;
        if (s1.current !== s2.current) return false;
        if (s1.playbackRate !== s2.playbackRate) return false;
        return true;
    }


    /**
     * ステータスの近似確認
     * @param s1 
     * @param s2 
     */
    public static IsNeer(s1: YouTubeStatusSender, s2: YouTubeStatusSender) {
        if (s1.state !== s2.state) return false;
        if (s1.playbackRate !== s2.playbackRate) return false;
        if (Math.abs(s1.current - s2.current) < 2.0 ) return false;
        return true;
    }
    
}