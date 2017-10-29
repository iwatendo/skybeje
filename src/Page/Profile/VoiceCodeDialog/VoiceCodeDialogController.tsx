
import LogUtil from "../../../Base/Util/LogUtil";
import StdUtil from "../../../Base/Util/StdUtil";

interface OnChangeVoiceCode { (voicecode: string): void }

export default class VoiceCodeDialogController {


    private static _dialog: VoiceCodeDialogController = new VoiceCodeDialogController('sbj-voice-code-dialog');

    private _voiceCodeBackgroundElement = document.getElementById("sbj-voice-code-background");

    private _voiceCodeUpdateButton = document.getElementById('sbj-voice-code-update') as HTMLInputElement;
    private _voiceCodeDialogCloseButton = document.getElementById('sbj-voice-code-dialog-close') as HTMLInputElement;
    private _voiceCodeCancelButton = document.getElementById('sbj-voice-code-cancel') as HTMLInputElement;
    private _voiceCodeElement = document.getElementById("sbj-voice-code-text") as HTMLInputElement;

    /**
     * 
     */
    public static Edit(voicecode: string, callback: OnChangeVoiceCode) {
        this._dialog.SetVoiceCode(voicecode);
        this._dialog.Show(callback);
    }

    private _dialog: any;
    private _voiceCode: string;
    private _owner_callback: OnChangeVoiceCode;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;

        this._voiceCodeBackgroundElement.onclick = (ev) => {
            if (ev.target == this._voiceCodeBackgroundElement)
                this.Close();
        };

        this._voiceCodeUpdateButton.onclick = (() => this.Done());
        this._voiceCodeDialogCloseButton.onclick = (() => this.Close());
        this._voiceCodeCancelButton.onclick = (() => this.Close());
    }


    /**
     * ガイドダイアログの表示
     * @param callback 
     */
    public Show(callback: OnChangeVoiceCode) {
        this._owner_callback = callback;
        this._dialog.showModal();
    }


    /**
     * ガイドデータの追加／更新
     */
    private Done() {
        this._owner_callback(this.GetVoiceCode());
        this.Close();
    }


    /**
     * 終了処理
     */
    private Close() {
        if (this._dialog && this._dialog.open) {
            this._dialog.close();
        }
    }


    /**
     * 
     * @param guide
     */
    private SetVoiceCode(voicecode: string) {
        this._voiceCodeElement.value = (voicecode ? voicecode : "");
        document.getElementById("sbj-voice-code-text-field").classList.add("is-dirty");
    }


    /**
     * 
     */
    private GetVoiceCode(): string {
        return this._voiceCodeElement.value;
    }

}
