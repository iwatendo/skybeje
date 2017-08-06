
import { Message } from "../IndexedDB/Timeline";
import LinkUtil from "./LinkUtil";
import LogUtil from "./LogUtil";

interface OnSpeechRecognition { (speech: string): void }
interface OnSpeechStart { (): void }
interface OnSpeechEnd { (): void }

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
    private static _isStart : boolean;

    /**
     * 音声認識処理
     */
    public static InitSpeechRecognition(callback: OnSpeechRecognition, onSpeechStart: OnSpeechStart = null, onSpeechEnd: OnSpeechEnd = null) {

        let win = window as any;

        win.SpeechRecognition = win.SpeechRecognition || webkitSpeechRecognition;
        this._recognition = new webkitSpeechRecognition();
        this._recognition.lang = 'ja';
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
            if (sre.error === "aborted" && sre.message === "") {
                //  AbortedはInfoログとする
                LogUtil.Info(null, "SpeechRecognitiaon Aborted.");
            }
            else {
                if (sre.error) LogUtil.Error(null, sre.error);
                if (sre.message) LogUtil.Error(null, sre.message);
            }

            this._isStart = false;
        };

        //
        if (onSpeechStart) { this._recognition.onsoundstart = (event: SpeechRecognitionEvent) => { onSpeechStart(); } }
        if (onSpeechEnd) { this._recognition.onsoundend = (event: SpeechRecognitionEvent) => { onSpeechEnd(); } }

        //
        this._recognition.onresult = (event: SpeechRecognitionEvent) => {
            let text = event.results.item(0).item(0).transcript;
            this._recognition.stop();
            callback(text);
        }

        this._recognition.onnomatch = (event: SpeechRecognitionEvent) => {
            this._recognition.stop();
            callback("");
        }

        //
        this._recognition.onend = (event: any) => {
            if (this._isStart) {
                this._recognition.start();
            }
        }
    }


    /**
     * 音声認識処理の開始
     */
    public static StartSpeechRecognition() {
        if (this._recognition) {
            this._isStart = true;
            this._recognition.start();
        }
    }


    /**
     * 音声認識処理の停止
     */
    public static StopSpeechRecognition() {
        if (this._recognition) {
            this._isStart = false;
            this._recognition.stop();
        }
    }

}


