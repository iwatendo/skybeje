
import StdUtil from "../../../Base/Util/StdUtil";
import FileUtil from "../../../Base/Util/FileUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import * as Enum from "../../../Base/Container/ImageInfo";
import { Icon } from "../../../Contents/IndexedDB/Personal";
import FileAttachUtil from "../../../Base/Util/FileAttachUtil";


interface OnChangeIcon { (icon: Icon): void }


export default class IconDialogController {


    private static _dialog: IconDialogController = new IconDialogController('sbj-image-dialog');

    private _imageBackgroundElement = document.getElementById("sbj-image-background");
    private _imageView = document.getElementById("sbj-image-view");
    private _attachButton = document.getElementById("sbj-image-attach") as HTMLButtonElement;
    private _cameraButton = document.getElementById("sbj-image-camera") as HTMLButtonElement;
    private _imageDropMsg = document.getElementById("sbj-image-drop-msg");

    private _messageColorElement = document.getElementById("sbj-message-color-value") as HTMLInputElement;
    private _balloonColorElement = document.getElementById("sbj-message-balloon-color-value") as HTMLInputElement;

    private _scaleElement = document.getElementById("sbj-image-dispratio") as HTMLInputElement;
    private _scaleValueElement = document.getElementById("sbj-image-dispratio-value") as HTMLInputElement;
    private _voiceCodeElement = document.getElementById("sbj-voice-code-text") as HTMLInputElement;


    /**
     * 
     */
    public static Add(callback: OnChangeIcon) {
        this.Start(true, false, false, new Icon(), callback);
    }


    /**
     * 
     */
    public static Edit(icon: Icon, callback: OnChangeIcon) {
        this.Start(false, true, false, icon, callback);
    }


    /**
     * 
     */
    public static Delete(icon: Icon, callback: OnChangeIcon) {
        this.Start(false, false, true, icon, callback);
    }


    /**
     * 
     * @param canAdd 
     * @param canEdit 
     * @param canDelete 
     * @param image 
     * @param callback 
     */
    private static Start(canAdd: boolean, canEdit: boolean, canDelete: boolean, icon: Icon, callback: OnChangeIcon) {

        document.getElementById('sbj-image-done').hidden = !canAdd;
        document.getElementById('sbj-image-update').hidden = !canEdit;
        document.getElementById('sbj-image-delete').hidden = !canDelete;

        //  削除のみの場合は編集できないようにする
        let canIconChange = (!canAdd && !canEdit && canDelete);
        document.getElementById('sbj-image-attach').hidden = canIconChange;
        document.getElementById('sbj-image-css-edit-check').hidden = canIconChange;

        //  CSS編集をOFFにする
        document.getElementById('sbj-image-css-edit-check').classList.remove('is-checked');
        let cssEditElement = document.getElementById('sbj-image-css-edit') as HTMLInputElement;
        cssEditElement.checked = false;

        this._dialog.SetCssEditMode(false);
        this._dialog._icon = Icon.Copy(icon);
        this._dialog.SetImage(this._dialog._icon.img);
        this._dialog.SetDispratio(icon.dispratio);
        this._dialog.SetVoiceCode(icon.voicecode);
        this._dialog.SetMessageColor(icon.msgcolor);
        this._dialog.SetMessageBalloonColor(icon.msgbackcolor);
        this._dialog.Show(callback);
    }


    private _dialog: any;
    private _icon: Icon;
    private _owner_callback: OnChangeIcon;

    private _bgsizeMap: Map<Enum.BgSizeEnum, HTMLElement> = null;
    private _bgposMap: Map<Enum.BgPosEnum, HTMLElement> = null;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;
        this._icon = new Icon();

        this._imageBackgroundElement.onclick = (ev) => {
            if (ev.target == this._imageBackgroundElement)
                this.Close();
        };

        FileAttachUtil.SetImageDropEvenet(
            this._imageView,
            this._attachButton,
            this._cameraButton,
            (file, src) => {
                let rec = this.CreateImageRec(src);
                this.SetImage(rec);
            }
        );

        //  CSS設定
        this._bgsizeMap = this.CreateBackgoundSizeMap();
        this._bgposMap = this.CreateBackgroundPostionMap();

        //  イベント設定
        this._bgposMap.forEach((element, key) => element.onclick = (e) => this.Refresh(null, key));
        this._bgsizeMap.forEach((element, key) => element.onclick = (e) => this.Refresh(key, null));

        document.getElementById('sbj-image-done').onclick = (() => this.Done());
        document.getElementById('sbj-image-update').onclick = (() => this.Done());
        document.getElementById('sbj-image-delete').onclick = (() => this.Delete());
        document.getElementById('sbj-image-close').onclick = (() => this.Close());
        document.getElementById('sbj-image-cancel').onclick = (() => this.Close());

        let cssEditElement = document.getElementById('sbj-image-css-edit') as HTMLInputElement;
        cssEditElement.onchange = (() => this.SetCssEditMode(cssEditElement.checked));
        this.SetCssEditMode(false);
    }


    /**
     * 
     */
    public CreateBackgoundSizeMap(): Map<Enum.BgSizeEnum, HTMLElement> {

        let result = new Map<Enum.BgSizeEnum, HTMLElement>();

        result.set(Enum.BgSizeEnum.Cover, document.getElementById('sbj-image-cover'));
        result.set(Enum.BgSizeEnum.Contain, document.getElementById('sbj-image-contain'));

        return result;
    }


    /**
     * 
     */
    public CreateBackgroundPostionMap(): Map<Enum.BgPosEnum, HTMLElement> {

        let result = new Map<Enum.BgPosEnum, HTMLElement>();
        result.set(Enum.BgPosEnum.Center, document.getElementById('sbj-image-center'));
        result.set(Enum.BgPosEnum.Top, document.getElementById('sbj-image-top'));
        result.set(Enum.BgPosEnum.Bottom, document.getElementById('sbj-image-bottom'));
        result.set(Enum.BgPosEnum.Left, document.getElementById('sbj-image-left'));
        result.set(Enum.BgPosEnum.Right, document.getElementById('sbj-image-right'));
        return result;
    }


    /**
     * 
     * @param isShowEdit 
     */
    public SetCssEditMode(isShowEdit: boolean) {
        this._bgsizeMap.forEach((element, key) => element.hidden = !isShowEdit);
        this._bgposMap.forEach((element, key) => element.hidden = !isShowEdit);
    }


    /**
     * イメージダイアログの表示
     * @param callback 
     */
    public Show(callback: OnChangeIcon) {
        this._owner_callback = callback;
        this._dialog.showModal();
    }


    /**
     * 画像データの追加／更新
     */
    private Done() {

        this._icon.dispratio = this.GetDispratio();
        this._icon.voicecode = this.GetVoiceCode();
        this._icon.msgcolor = this.GetMessageColor();
        this._icon.msgbackcolor = this.GetMessageBalloonColor();

        this._owner_callback(this._icon);
        this.Close();
    }


    /**
     * 画像データの削除
     */
    private Delete() {
        this._owner_callback(null);
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
     * 画像データ生成
     * @param src
     */
    private CreateImageRec(src): ImageInfo {
        let rec = new ImageInfo();
        rec.src = src;
        this._icon.img = rec;
        return rec;
    }


    /**
     * 画像の再描画とCSSアイコンの設定
     * @param bg_size
     * @param bg_pos 
     */
    private Refresh(bg_size: Enum.BgSizeEnum, bg_pos: Enum.BgPosEnum) {

        if (this._icon.img) {

            if (bg_size !== null) {
                this._icon.img.backgroundsize = bg_size;
            }

            if (bg_pos !== null) {
                this._icon.img.backgroundposition = bg_pos;
            }

            this.SetImage(this._icon.img);
        }
    }


    /**
     * 画像の表示
     * @param image
     */
    private SetImage(image: ImageInfo) {

        if (image == null) {
            image = new ImageInfo();
        }

        this._icon.img = image;

        let imgStyle = this._imageView.style;

        imgStyle.width = "424px";
        imgStyle.height = "424px";

        if (image.src == null || image.src.length == 0) {
            imgStyle.background = "";
            this.SetEditButtonDisabled(true);
        } else {
            this.SetEditButtonDisabled(false);
        }

        //  画像のCSS変更
        ImageInfo.SetCss(this._imageView.id, image);

        //  CSS選択アイコンの変更
        this._bgsizeMap.forEach((value, key) => value.classList.remove('sbj-image-css-selection'));
        this._bgsizeMap.get(image.backgroundsize).classList.add('sbj-image-css-selection');

        this._bgposMap.forEach((value, key) => value.classList.remove('sbj-image-css-selection'));
        this._bgposMap.get(image.backgroundposition).classList.add('sbj-image-css-selection');
    }


    /**
     * 追加/更新ボタンの制御
     * @param disabled 
     */
    private SetEditButtonDisabled(disabled: boolean) {
        (document.getElementById('sbj-image-done') as HTMLInputElement).disabled = disabled;
        (document.getElementById('sbj-image-update') as HTMLInputElement).disabled = disabled;
        this._imageDropMsg.hidden = !disabled;
    }


    /**
     * メッセージの文字色設定
     * @param value 
     */
    private SetMessageColor(value: string) {

        if (!value) {
            value = "#f5f5f5";
        }

        this._messageColorElement.value = value;
    }


    /**
     * メッセージの文字色取得
     */
    private GetMessageColor(): string {
        return this._messageColorElement.value;
    }


    /**
     * メッセージの背景色取得
     * @param value 
     */
    private SetMessageBalloonColor(value: string) {

        if (!value) {
            value = "#191970";
        }

        this._balloonColorElement.value = value;
    }


    /**
     * メッセージの背景色取得
     */
    private GetMessageBalloonColor(): string {
        return this._balloonColorElement.value;
    }


    /**
     * 立絵サイズのセット
     * @param scale 
     */
    private SetDispratio(scale: number) {

        if (!scale)
            scale = 8;

        this._scaleElement.classList.add("is-dirty");
        this._scaleValueElement.value = scale.toString();
    }


    /**
     * 立絵サイズの取得
     */
    private GetDispratio(): number {
        return Number.parseInt(this._scaleValueElement.value);
    }


    /**
     * VoiceCode設定
     * @param voicecode
     */
    private SetVoiceCode(voicecode: string) {
        this._voiceCodeElement.value = (voicecode ? voicecode : "");
        document.getElementById("sbj-voice-code-text-field").classList.add("is-dirty");
    }


    /**
     * VoiceCode取得
     */
    private GetVoiceCode(): string {
        return this._voiceCodeElement.value;
    }


}


