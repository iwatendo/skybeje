import Sender from "../../Base/Container/Sender";

/**
 *  字幕表示通知用処理
 */
export default class CastSubTitlesSender extends Sender {

    public static ID = "CastSpeechRecognition";

    constructor(message: string) {
        super(CastSubTitlesSender.ID)
        this.message = message;
    }

    message: string;
}
