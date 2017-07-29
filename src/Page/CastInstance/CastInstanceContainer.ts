import * as Home from "../../Base/IndexedDB/Home";

import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Base/Container/ActorInfo";


/**
 * ライブキャスト時のオプション設定
 */
export class LiveCastOptions {

    SelectMic: string;
    SelectCam: string;
    IsSpeechRecognition: boolean;
    IsIconCursor: boolean;
}


/**
 *  ライブキャストの起動通知 及び 設定変更通知
 */
export class CastInstanceSender extends Sender {

    public static ID = "CastInstance";

    constructor() {
        super(CastInstanceSender.ID)
        this.setting = new CastSettingSender();
    }

    instanceUrl: string;
    clientUrl: string;
    setting: CastSettingSender;
}


/**
 * ライブキャストをルーム情報
 */
export class CastRoomSender extends Sender {
    public static ID = "CastRoom";

    constructor() {
        super(CastRoomSender.ID)
    }

    room: Home.Room;
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
        this.isControlClose = false;
        this.isControlHide = false;
        this.dispUserCursor = false;
        this.dispSubtitles = false;
    }
    isStreaming: boolean;
    isControlClose: boolean;
    isControlHide: boolean;
    dispSubtitles: boolean;
    dispUserCursor: boolean;
}


/**
 * 
 */
export class CastCursorSender extends Sender {

    public static ID = "CastCursor";

    constructor() {
        super(CastCursorSender.ID)
        this.peerid = "";
        this.aid = "";
        this.iid = "";
        this.posRx = 0;
        this.posRy = 0;
    }

    peerid: string;
    aid: string;
    iid: string;
    posRx: number;
    posRy: number;
}


/**
 *  音声認識からのメッセージ
 */
export class CastSpeechRecognitionSender extends Sender {

    public static ID = "CastSpeechRecognition";

    constructor(message: string) {
        super(CastSpeechRecognitionSender.ID)
        this.message = message;
    }

    message: string;
}
