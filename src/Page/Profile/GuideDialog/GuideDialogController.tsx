import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import FileUtil from "../../../Base/Util/FileUtil";
import YouTubeUtil, { YouTubeOption } from "../../../Base/Util/YouTubeUtil";
import LogUtil from "../../../Base/Util/LogUtil";
import NoEmbedComponent from "./NoEmbed/NoEmbedComponent";
import YouTubeComponent from "./YouTube/YouTubeComponent";

interface OnDropGuide { (owner: GuideDialogController, file: File, src): void }
interface OnChangeGuide { (guideRec: Personal.Guide): void }


export default class GuideDialogController {


    private static _dialog: GuideDialogController = new GuideDialogController('sbj-guide-dialog');

    private _guideBackgroundElement = document.getElementById("sbj-guide-background");
    private _guideView = document.getElementById("sbj-guide-main");


    private _guideAppendButton = document.getElementById('sbj-guide-append') as HTMLInputElement;
    private _guideUpdateButton = document.getElementById('sbj-guide-update') as HTMLInputElement;
    private _guideDeleteButton = document.getElementById('sbj-guide-delete') as HTMLInputElement;
    private _guideDialogCloseButton = document.getElementById('sbj-guide-dialog-close') as HTMLInputElement;
    private _guideCancelButton = document.getElementById('sbj-guide-cancel') as HTMLInputElement;
    private _guideKeywordElement = document.getElementById("sbj-gaide-keyword") as HTMLInputElement;
    private _guideNoteElement = document.getElementById("sbj-gaide-note") as HTMLInputElement;
    private _guideGadgetElement = document.getElementById('sbj-guide-gadget') as HTMLInputElement;

    /**
     * 
     */
    public static Add(callback: OnChangeGuide) {
        this.Start(true, false, false, new Personal.Guide(), callback);
    }


    /**
     * 
     */
    public static Edit(guide: Personal.Guide, callback: OnChangeGuide) {
        this.Start(false, true, false, guide, callback);
    }


    /**
     * 
     */
    public static Delete(guide: Personal.Guide, callback: OnChangeGuide) {
        this.Start(false, false, true, guide, callback);
    }


    /**
     * 
     * @param canAdd 
     * @param canEdit 
     * @param canDelete 
     * @param guide 
     * @param callback 
     */
    private static Start(canAdd: boolean, canEdit: boolean, canDelete: boolean, guide: Personal.Guide, callback: OnChangeGuide) {
        document.getElementById('sbj-guide-append').hidden = !canAdd;
        document.getElementById('sbj-guide-update').hidden = !canEdit;
        document.getElementById('sbj-guide-delete').hidden = !canDelete;

        //  削除のみの場合は編集できないようにする
        this.SetDisabled(!canAdd && !canEdit && canDelete);

        this._dialog.SetGuide(guide);
        this._dialog.Show(callback);
    }


    private _dialog: any;
    private _guide: Personal.Guide;
    private _owner_callback: OnChangeGuide;

    /**
     * コンストラクタ
     * @param dialogName イメージダイアログのID
     */
    public constructor(dialogName: string) {

        StdUtil.StopPropagation();

        this._dialog = document.getElementById(dialogName) as any;
        this._guide = new Personal.Guide();

        this._guideBackgroundElement.onclick = (ev) => {
            if (ev.target == this._guideBackgroundElement)
                this.Close();
        };

        //  ガイドエリアのイベント（ドラック＆ドロップ用）
        this._guideView.ondragover = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            this._guideView.focus();
        };

        //  ドロップ時イベント
        this._guideView.ondrop = (event: DragEvent) => {
            event.preventDefault();

            var items = event.dataTransfer.items;

            var i = 0;
            for (i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.type == "text/uri-list") {
                    item.getAsString((url) => { this.DropUrl(this._guide, url); });
                }
            }
        };

        this._guideKeywordElement.oninput = () => { this.SetDoneDisabled(); }
        this._guideNoteElement.oninput = () => { this.SetDoneDisabled(); }

        this._guideAppendButton.onclick = (() => this.Done());
        this._guideUpdateButton.onclick = (() => this.Done());
        this._guideDeleteButton.onclick = (() => this.Delete());
        this._guideDialogCloseButton.onclick = (() => this.Close());
        this._guideCancelButton.onclick = (() => this.Close());

        YouTubeUtil.Initialize("sbj-youtube-api-ready", "sbj-guide-youtube-player");
    }


    /**
     * ガイドダイアログの表示
     * @param callback 
     */
    public Show(callback: OnChangeGuide) {
        this._owner_callback = callback;
        this._dialog.showModal();
    }


    /**
     * ガイドデータの追加／更新
     */
    private Done() {
        this._owner_callback(this.GetGuide());
        this.Close();
    }


    /**
     * ガイドデータの削除
     */
    private Delete() {
        this._owner_callback(this.GetGuide());
        this.Close();
    }


    /**
     * 終了処理
     */
    private Close() {
        if (this._dialog && this._dialog.open) {
            this.ClearEmbedItem();
            this._dialog.close();
        }
    }


    /**
     * ガイドデータ生成
     * @param src
     */
    private CreateGuideRec(src): Personal.Guide {
        let rec = new Personal.Guide();
        return rec;
    }


    /**
     * 
     * @param disabled 
     */
    private static SetDisabled(disabled: boolean) {

        (document.getElementById("sbj-gaide-match-options-0") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-match-options-1") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-rescheck-options-0") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-rescheck-options-1") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-rescheck-options-2") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-keyword") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-gaide-note") as HTMLInputElement).disabled = disabled;
        (document.getElementById("sbj-guide-gadget") as HTMLInputElement).disabled = disabled;
    }


    /**
     * 
     */
    private SetDoneDisabled() {

        let isDoneDisabled = false;
        if (this._guideKeywordElement.value.length === 0) isDoneDisabled = true;
        //  if (this._guideNoteElement.value.length === 0) isDoneDisabled = true;

        this._guideAppendButton.disabled = isDoneDisabled;
        this._guideUpdateButton.disabled = isDoneDisabled;
    }


    /**
     * ガイドの表示
     * @param guide
     */
    private SetGuide(guide: Personal.Guide) {

        if (guide == null) {
            guide = new Personal.Guide();
        }

        guide = StdUtil.DeepCopy(guide);
        this._guide = guide;

        {
            let options = (document.getElementsByName("sbj-gaide-match-options"));
            let element = options[guide.matchoption] as HTMLInputElement;
            if (element) {
                element.click();    //  暫定対応
            }
        }

        {
            let options = (document.getElementsByName("sbj-gaide-rescheck-options"));
            let element = options[guide.rescheckoption] as HTMLInputElement;
            if (element) {
                element.click();    //  暫定対応
            }
        }

        let kf = document.getElementById("sbj-guide-keywaord-field")
        if (guide.keyword) { kf.classList.add("is-dirty"); } else { kf.classList.remove("is-dirty"); }
        let nf = document.getElementById("sbj-guide-note-field")
        if (guide.note) { nf.classList.add("is-dirty"); } else { nf.classList.remove("is-dirty"); }

        this._guideKeywordElement.value = guide.keyword;
        this._guideNoteElement.value = guide.note;

        this.DisplayEmbedItem(guide);
        this.SetDoneDisabled();
    }

    /**
     * ガイドの表示
     * @param guide
     */
    private GetGuide(): Personal.Guide {

        let result = StdUtil.DeepCopy(this._guide);

        if ((document.getElementById("sbj-gaide-match-options-0") as HTMLInputElement).checked) result.matchoption = 0;
        if ((document.getElementById("sbj-gaide-match-options-1") as HTMLInputElement).checked) result.matchoption = 1;

        if ((document.getElementById("sbj-gaide-rescheck-options-0") as HTMLInputElement).checked) result.rescheckoption = 0;
        if ((document.getElementById("sbj-gaide-rescheck-options-1") as HTMLInputElement).checked) result.rescheckoption = 1;
        if ((document.getElementById("sbj-gaide-rescheck-options-2") as HTMLInputElement).checked) result.rescheckoption = 2;

        result.keyword = (document.getElementById("sbj-gaide-keyword") as HTMLInputElement).value;
        result.note = (document.getElementById("sbj-gaide-note") as HTMLInputElement).value;

        return result;
    }


    /**
     * URLのドロップ時処理
     * @param url
     */
    public DropUrl(guide: Personal.Guide, url: string) {

        let tubeId = YouTubeUtil.GetYouTubeID(url);

        if (tubeId.length === 0)
            return;

        let option = new YouTubeOption();
        option.id = tubeId;
        guide.url = YouTubeUtil.ToEmbedYouTubeURL(tubeId);
        guide.embedstatus = JSON.stringify(option);

        this.ClearEmbedItem();
        this.DisplayEmbedItem(guide);
    }


    /**
     * 組込アイテムのクリア
     * @param guide 
     */
    public ClearEmbedItem() {
        this.DisplayEmbedItem(new Personal.Guide());
    }


    /**
     * 組込アイテムの表示
     * @param guide 
     */
    private DisplayEmbedItem(guide: Personal.Guide) {

        let element = document.getElementById('sbj-guide-gadget');

        if (guide.url.indexOf("www.youtube.com/embed/") >= 0) {
            ReactDOM.render(<YouTubeComponent controller={this} guide={guide} />, element, () => {
                let opt = JSON.parse(guide.embedstatus) as YouTubeOption;
                this.SetYouTubePlayer(opt, () => {
                    guide.url = YouTubeUtil.ToEmbedYouTubeURL(opt.id);
                    guide.embedstatus = JSON.stringify(opt);
                    ReactDOM.render(<YouTubeComponent controller={this} guide={guide} />, element);
                });
            });
        }
        else {
            ReactDOM.render(<NoEmbedComponent controller={this} />, element, () => {
            });
        }

    }


    /**
     * 
     * @param opt 
     * @param callback 
     */
    public SetYouTubePlayer(opt: YouTubeOption, callback) {

        //  動画情報を取得して再表示
        YouTubeUtil.GetPlayer(opt, true, (player) => {
            var vd = (player as any).getVideoData();
            if (vd) {
                opt.id = opt.id;
                opt.title = vd.title;
                opt.last = player.getDuration();
                if (opt.start <= 0) opt.start = 0;
                if (opt.end <= 0) opt.end = opt.last;
            }

            player.addEventListener('onStateChange', (event) => {
                let state = ((event as any).data) as YT.PlayerState;

                switch ((event as any).data) {
                    case YT.PlayerState.PLAYING:
                        break;
                    case YT.PlayerState.ENDED:
                        break;
                    case YT.PlayerState.PAUSED:
                        break;
                    case YT.PlayerState.CUED:
                        break;
                }
            });

            callback();
        });
    }

}
