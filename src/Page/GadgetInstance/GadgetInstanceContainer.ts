import * as Home from "../../Base/IndexedDB/Home";
import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Base/Container/ActorInfo";


/**
 * ガジェットキャスト時のオプション設定
 */
export class LiveGadgetOptions {
    IsIconCursor: boolean;
}


/**
 *  ガジェットキャストの起動通知 及び 設定変更通知
 */
export class GadgetInstanceSender extends Sender {

    public static ID = "GadgetInstance";

    constructor() {
        super(GadgetInstanceSender.ID)
        this.setting = new CastSettingSender();
    }

    instanceUrl: string;
    clientUrl: string;
    setting: CastSettingSender;
}


/**
 * 
 */
export class GetCastInfoSedner extends Sender {

    public static ID = "GetCastInfo";

    constructor() {
        super(GetCastInfoSedner.ID);
    }
}


/**
 * 
 */
export class CastSettingSender extends Sender {

    public static ID = "CastSetting";

    constructor() {
        super(CastSettingSender.ID);
        this.isStreaming = false;
        this.isScreenShare = false;
        this.isControlClose = false;
        this.isControlHide = false;
        this.dispUserCursor = false;
        this.dispSubtitles = false;
    }
    isStreaming: boolean;
    isScreenShare: boolean;
    isControlClose: boolean;
    isControlHide: boolean;
    dispSubtitles: boolean;
    dispUserCursor: boolean;
}