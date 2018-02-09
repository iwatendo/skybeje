import Sender from "../../Base/Container/Sender";

/**
 *  音声認識からのメッセージ通知
 */
export default class CastSpeechRecognitionSender extends Sender {

    public static ID = "CastSpeechRecognition";

    constructor(message: string) {
        super(CastSpeechRecognitionSender.ID)
        this.message = message;
    }

    message: string;
}
