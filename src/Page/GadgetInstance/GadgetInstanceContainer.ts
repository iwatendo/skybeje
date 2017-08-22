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
        this.setting = new GadgetCastSettingSender();
    }

    instanceUrl: string;
    clientUrl: string;
    setting: GadgetCastSettingSender;
}


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
        this.isStreaming = false;
        
        this.isControlClose = false;
        this.isControlHide = false;
        this.dispUserCursor = false;
    }
    isStreaming: boolean;
    
    isControlClose: boolean;
    isControlHide: boolean;
    dispUserCursor: boolean;
}