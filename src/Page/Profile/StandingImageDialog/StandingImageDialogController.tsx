
import LogUtil from "../../../Base/Util/LogUtil";
import StdUtil from "../../../Base/Util/StdUtil";

interface OnChangeStandingImage { (scale: number): void }

export default class StandingImageDialogController {


    private static _dialog: StandingImageDialogController = new StandingImageDialogController('sbj-standing-image-dialog');

    private _backgroundElement = document.getElementById("sbj-standing-image-background");

    private _updateButton = document.getElementById('sbj-standing-image-update') as HTMLInputElement;
    private _dialogCloseButton = document.getElementById('sbj-standing-image-dialog-close') as HTMLInputElement;
    private _cancelButton = document.getElementById('sbj-standing-image-cancel') as HTMLInputElement;
    private _scaleElement = document.getElementById("sbj-standing-image-scale-value") as HTMLInputElement;

    /**
     * 
     */
    public static Edit(voicecode: number, callback: OnChangeStandingImage) {
        this._dialog.SetStandingImage(voicecode);
        this._dialog.Show(callback);
    }

    private _dialog: any;
    private _scale: number;
    private _owner_callback: OnChangeStandingImage;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;

        this._backgroundElement.onclick = (ev) => {
            if (ev.target == this._backgroundElement)
                this.Close();
        };

        this._updateButton.onclick = (() => this.Done());
        this._dialogCloseButton.onclick = (() => this.Close());
        this._cancelButton.onclick = (() => this.Close());
    }


    /**
     * 立ち絵設定ダイアログの表示
     * @param callback 
     */
    public Show(callback: OnChangeStandingImage) {
        this._owner_callback = callback;
        this._dialog.showModal();
    }


    /**
     * 更新ボタン押下時
     */
    private Done() {
        this._owner_callback(this.GetStandingImage());
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


    private SetStandingImage(scale: number) {
        this._scaleElement.value = (scale ? scale.toString() : "");
        document.getElementById("sbj-standing-image-scale").classList.add("is-dirty");
    }


    /**
     * 
     */
    private GetStandingImage(): number {
        return Number.parseInt(this._scaleElement.value);
    }

}
