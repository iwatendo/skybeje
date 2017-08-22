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
 * スクリーンシェアオプション設定
 */
export class ScreenShareOptions {
    constructor() {
        this.FrameRage = 15;
        this.Resolution = 1;
        this.IsIconCursor = false;
    }
    Resolution: number;
    FrameRage: number;
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
