import Sender from "../../Base/Container/Sender";


/**
 * 配信する種類
 */
export enum CastTypeEnum {
    LiveCast = 1,
    ScreenShare = 2,
    Gadget = 3,
}


/**
 *  ライブキャストの起動通知 及び 設定変更通知
 *  CastInstance の起動元クライアント (HomeVisitor) へ通知
 */
export class CastInstanceSender extends Sender {

    public static ID = "CastInstance";

    constructor(type: CastTypeEnum) {
        super(CastInstanceSender.ID)
        this.castType = type;
        this.isStreaming = false;
        this.isClose = false;
        this.islHide = false;
    }

    castType: CastTypeEnum;
    instanceUrl: string;
    clientUrl: string;
    isStreaming: boolean;
    isClose: boolean;
    islHide: boolean;
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
        this.dispUserCursor = false;
        this.dispSubtitles = false;
    }
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
