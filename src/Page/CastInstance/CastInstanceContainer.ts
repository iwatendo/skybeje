import Sender from "../../Base/Container/Sender";


/**
 *  ライブキャストの起動通知 及び 設定変更通知
 *  CastInstance の起動元クライアント (HomeVisitor) へ通知
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
 * ライブキャストの設定要求
 * キャスト表示クライアント(CastVisitor)起動時に、キャスト元(CastInstance)へ設定を要求する為のSender
 */
export class GetCastSettingSedner extends Sender {

    public static ID = "GetCastInfo";

    constructor() {
        super(GetCastSettingSedner.ID);
    }
}


/**
 * ライブキャストの設定通知
 * キャスト表示クライアント(CastVisitor)起動時に、キャスト元(CastInstance)へ設定を通知する為のSender
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
