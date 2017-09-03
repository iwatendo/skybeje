import * as React from 'react';
import * as ReactDOM from 'react-dom';
import StdUtil from "../../../Base/Util/StdUtil";

export default class SettingDialogController {


    private static _dialog: SettingDialogController = new SettingDialogController('sbj-cast-instance-setting-dialog');

    private _backgroundElement = document.getElementById("sbj-cast-instance-setting-background");
    private _closeButton = document.getElementById('sbj-cast-instance-setting-close') as HTMLInputElement;

    /**
     * 
     */
    public static Show() {
        this._dialog.Show();
    }


    private _dialog: any;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;

        if(this._backgroundElement && this._closeButton){
            this._backgroundElement.onclick = (ev) => {
                if (ev.target == this._backgroundElement)
                    this.Close();
            };

            this._closeButton.onclick = (ev) => {
                this.Close();
            };
        }
    }


    /**
     * ガイドダイアログの表示
     * @param callback 
     */
    public Show() {
        this._dialog.showModal();
    }


    /**
     * ガイドデータの追加／更新
     */
    private Done() {
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

}
