
import { Message } from "../IndexedDB/Timeline";
import LinkUtil from "./LinkUtil";
import LogUtil from "./LogUtil";

interface OnSpeechRecognition { (speech: string): void }

export default class SpeechUtil {

    /**
     * 音声出力処理
     * @param msg メッセージ
     */
    private static Speech(msg: Message) {
        let syaberi = new SpeechSynthesisUtterance();
        syaberi.volume = 0.8;
        syaberi.rate = 1.24;
        syaberi.pitch = 1.00;
        syaberi.text = msg.text;
        syaberi.lang = "ja-JP";
        syaberi.onend = function (event) { }
        speechSynthesis.speak(syaberi);
    }


    /**
     *  
     */
    private static _recognition;


    /**
     * 音声認識処理
     */
    public static InitSpeechRecognition(callback: OnSpeechRecognition) {

        let win = window as any;

        win.SpeechRecognition = win.SpeechRecognition || webkitSpeechRecognition;
        this._recognition = new webkitSpeechRecognition();
        this._recognition.lang = 'ja';

        let isErrorStop = false;

        //
        this._recognition.onerror = (sre: SpeechRecognitionError) => {

            //  NoSpeechエラーは無視
            if (sre.error === "no-speech") {
                return;
            }

            //  それら以外のエラーは、音声認識処理を止める？
            if (sre.error === "network" && location.href.indexOf("localhost") > 0) {
                //  SpeechRecognitiaonはローカルホストでは起動しない（httpsじゃないと動かせない）
                //  メッセージは表示するけれどエラーとはしない。
                LogUtil.Warning(null, "SpeechRecognitiaon will not start on Localhost.");
            }
            else {
                if (sre.error) LogUtil.Error(null, sre.error);
                if (sre.message) LogUtil.Error(null, sre.message);
            }

            isErrorStop = true;
        };


        //
        this._recognition.onresult = (event: SpeechRecognitionEvent) => {

            let text = event.results.item(0).item(0).transcript;
            this._recognition.stop();

            callback(text);
        }

        //
        this._recognition.onend = (event: any) => {
            if (!isErrorStop) {
                this._recognition.start();
            }
        }
    }


    /**
     * 音声認識処理の開始
     */
    public static StartSpeechRecognition() {
        if (this._recognition) {
            this._recognition.start();
        }
    }


    /**
     * 音声認識処理の停止
     */
    public static StopSpeechRecognition() {
        if (this._recognition) {
            this._recognition.stop();
        }
    }

}


