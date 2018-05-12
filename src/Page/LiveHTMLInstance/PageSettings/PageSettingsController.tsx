import * as JQuery from "jquery";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LiveHTMLInstanceController from '../LiveHTMLInstanceController';
import PageSettingsComponent from './PageSettingsComponent';
import { PageSettings, CtrlLayerEnum } from '../../../Contents/IndexedDB/LiveHTML';
import StdUtil from "../../../Base/Util/StdUtil";
import MdlUtil from "../../../Contents/Util/MdlUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import ChatStatusSender from "../../../Contents/Sender/ChatStatusSender";
import HtmlGenerator from "../HtmlGenerator";


/**
 * 
 */
export default class PageSettingsController {

    private _element: HTMLElement;
    private _controller: LiveHTMLInstanceController;
    private _previewPageSetting: PageSettings;
    private _selectPageSetting: PageSettings;
    private _pageList: Array<PageSettings>;
    private _chatlinkageMap: Map<string, PageSettings>;


    /**
     * 
     */
    public constructor(controller: LiveHTMLInstanceController, element: HTMLElement) {
        this._controller = controller;
        this._element = element;
        this._previewPageSetting = new PageSettings();
        this._selectPageSetting = new PageSettings();

        //  ESCキーで閉じる
        document.onkeydown = (e: KeyboardEvent) => {
            if (e.keyCode === 27) {
                //  HTML入力中にESCを押すケースがあるので閉じないようにする
                //  this.Close(); 
            }
        }

        //  周囲の半透明エリアのクリックで閉じる
        document.getElementById('sbj-livehtml-edit-content').onclick = (e: MouseEvent) => {
            let targetId = (e.target as HTMLElement).id;
            if (targetId === 'sbj-livehtml-edit-content') {
                this.Close();
            }
        };

        //  
        document.getElementById('sbj-livehtml-page-edit-close').onclick = (e) => { this.Close(); }
        document.getElementById('sbj-livehtml-pagesettings-cancel').onclick = (e) => { this.Close(); }
        document.getElementById('sbj-livehtml-pagesettings-save').onclick = (e) => { this.Save(); }
        document.getElementById('sbj-livehtml-pagesettings-save-close').onclick = (e) => { this.Save(); this.Close(); }

        //  編集ボタン郡
        document.getElementById('sbj-livehtml-page-add').onclick = (e) => { this.OnClickPageAdd(); };
        document.getElementById('sbj-livehtml-page-copy').onclick = (e) => { this.OnClickPageCopy(); };
        document.getElementById('sbj-livehtml-page-edit').onclick = (e) => { this.OnClickPageEdit(); };
        document.getElementById('sbj-livehtml-page-delete').onclick = (e) => { this.OnClickPageDelete(); };

        //  検索テキスト入力
        document.getElementById('sbj-livehtml-page-search-text').oninput = (e) => { this.OnSearch(); };

        //  アスペクト比率の指定有無
        document.getElementById('sbj-check-aspect-disp').onchange = (e) => {
            this.ChangeAspectFixed(this.GetPageSettings());
            this.CheckChangeSaveDisable();
        }

        //  アスペクト比変更時
        document.getElementById('sbj-aspect-width').oninput = (e) => {
            this.ChangeAspect(this.GetPageSettings());
            this.CheckChangeSaveDisable();
        }
        document.getElementById('sbj-aspect-height').oninput = (e) => {
            this.ChangeAspect(this.GetPageSettings());
            this.CheckChangeSaveDisable();
        }

        //  ページ名称変更イベント
        document.getElementById('sbj-livehtml-value-name').oninput = (e) => {
            this.CheckChangeSaveDisable();
        };

        //  タグ変更時
        document.getElementById('sbj-livehtml-value-tag').oninput = (e) => {
            this.CheckChangeSaveDisable();
        };

        //  チャット連動変更時
        document.getElementById('sbj-livehtml-value-chatlinkage').oninput = (e) => {
            this.CheckChangeSaveDisable();
        };

        //  レイヤ設定変更
        for (let i = 1; i <= 4; i++) {
            let element = document.getElementById('sbj-livehtml-value-layer' + i.toString()) as HTMLTextAreaElement;
            element.onchange = (e) => { this.ChangeHTML(this.GetPageSettings()); }
            element.oninput = (e) => { this.CheckChangeSaveDisable(); }
            //  URL等のドロップ時処理(URLを加工しHTMLとして貼り付ける)
            HtmlGenerator.SetEvent(element, (html) => {
                element.value = html;
                this.ChangeHTML(this.GetPageSettings());
                this.CheckChangeSaveDisable();
            });
        }

        //  コントロールレイヤオプション
        for (let i = 1; i <= 3; i++) {
            document.getElementById('sbj-ctrl-layer-option-' + i.toString()).onchange = (e) => {
                this.CheckChangeSaveDisable();
            }
        }

        //  グループ通話機能の設置
        document.getElementById('sbj-livehtml-set-voicecaht').onclick = (e) => {
            this.SetVoiceChatHTML();
        };

        this.Display();
    }


    /**
     * 
     */
    public Display() {

        //  データ読込
        this._controller.Model.GetPageSettingsAll((pss) => {
            //  ソート
            pss.sort(this.PageSettingCompare);
            //  リスト表示
            this._pageList = pss;
            this.SetChatLinkage(pss);
            this.DisplayList(pss);
        });
    }


    /**
     * 
     * @param pss 
     */
    public SetChatLinkage(pss: Array<PageSettings>) {

        this._chatlinkageMap = new Map<string, PageSettings>();

        pss.forEach(ps => {
            let kw = (ps.chatLinkage ? ps.chatLinkage.trim() : "");
            if (kw.length > 0) {
                this._chatlinkageMap.set(kw.toLowerCase(), ps);
            }
        });
    }


    /**
     * 
     * @param chat 
     */
    public ChceckChatLinkage(chat: ChatStatusSender) {

        let msg = (chat.message ? chat.message.trim().toLowerCase() : "");

        if (this._chatlinkageMap && msg.length > 0) {
            if (this._chatlinkageMap.has(msg)) {
                let ps = this._chatlinkageMap.get(msg);
                this._controller.View.SendLiveHTML(ps);
                this.DisplayList(this._pageList);
            }
        }
    }



    /**
     * 検索文字入力時
     */
    public OnSearch() {
        if (this._pageList) {
            this.DisplayList(this._pageList);
        }
    }


    /**
     * ページフィルター
     * @param ps 
     * @param st 
     */
    public PageFilter(ps: PageSettings, st: string) {
        if (ps) {
            if (ps.pageName.toLowerCase().indexOf(st) >= 0) return true;
            if (ps.pageTag.toLowerCase().indexOf(st) >= 0) return true;
        }
        return false;
    }


    /**
     * 
     * @param pss 
     */
    public DisplayList(pss: Array<PageSettings>) {

        let searchText = (document.getElementById('sbj-livehtml-page-search-text') as HTMLInputElement).value.trim().toLowerCase();
        let dispList = pss;

        let select = (this._selectPageSetting ? this._selectPageSetting.pageId : "");   //  選択行

        if (searchText.length) {
            dispList = pss.filter((ps) => this.PageFilter(ps, searchText));

            //  絞り込みの結果に選択行が含まれない場合、選択を解除
            if (select) {
                if (dispList.filter((ps) => (ps.pageId === select)).length === 0) {
                    select = "";
                    this.SetSelect(null);
                }
            }
        }

        ReactDOM.render(<PageSettingsComponent controller={this._controller} items={dispList} selectItem={select} />, this._element, () => { });
    }


    /**
     * ページ設定のソート用関数
     * @param a 
     * @param b 
     */
    public PageSettingCompare(a: PageSettings, b: PageSettings): number {

        let apn = a.pageName.toLocaleLowerCase();
        let bpn = b.pageName.toLocaleLowerCase();

        if (apn < bpn) return -1;
        if (apn > bpn) return 1;

        let apt = a.pageTag.toLocaleLowerCase();
        let bpt = b.pageTag.toLocaleLowerCase();

        if (apt < bpt) return -1;
        if (apt > bpt) return 1;

        return 0;
    }


    /**
     * ページ名称の入力チェック
     */
    public CheckChangeSaveDisable(isInitSave: boolean = false) {

        let isDisable = false;

        let saveButton = document.getElementById('sbj-livehtml-pagesettings-save') as HTMLButtonElement;
        let saveCloaseBtton = document.getElementById('sbj-livehtml-pagesettings-save-close') as HTMLButtonElement;

        if (!isInitSave) {
            let value = (document.getElementById('sbj-livehtml-value-name') as HTMLInputElement).value;
            //  ページ名が設定されていない場合、更新ボタンを押せないようにする
            isDisable = (value.length === 0);
        }
        else {
            //  初期化時や保存時は更新ボタンを押せないようにする
            //  ※ユーザー入力を検出した場合、押せるようになる
            isDisable = true;
        }

        saveButton.disabled = isDisable;
        saveCloaseBtton.disabled = isDisable;
    }


    /**
     * 
     */
    public GetPageSettings(): PageSettings {
        let sender = new PageSettings();

        sender.pageId = this._previewPageSetting.pageId;
        sender.pageName = (document.getElementById('sbj-livehtml-value-name') as HTMLInputElement).value;
        sender.pageTag = (document.getElementById('sbj-livehtml-value-tag') as HTMLInputElement).value;
        sender.chatLinkage = (document.getElementById('sbj-livehtml-value-chatlinkage') as HTMLInputElement).value;
        sender.isAspectFix = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;
        sender.aspectW = Number.parseInt((document.getElementById('sbj-aspect-width') as HTMLInputElement).value);
        sender.aspectH = Number.parseInt((document.getElementById('sbj-aspect-height') as HTMLInputElement).value);
        sender.layerBackgroundB = (document.getElementById('sbj-livehtml-value-layer1') as HTMLInputElement).value;
        sender.layerBackgroundF = (document.getElementById('sbj-livehtml-value-layer2') as HTMLInputElement).value;
        sender.layerActive = (document.getElementById('sbj-livehtml-value-layer3') as HTMLInputElement).value;
        sender.layerControl = (document.getElementById('sbj-livehtml-value-layer4') as HTMLInputElement).value;
        sender.ctrlLayerMode = this.CtrlLayerMode;

        return sender;
    }


    /**
     * 
     */
    public get CtrlLayerMode(): CtrlLayerEnum {
        if ((document.getElementById('sbj-ctrl-layer-option-1') as HTMLInputElement).checked) return CtrlLayerEnum.Overlay;
        if ((document.getElementById('sbj-ctrl-layer-option-2') as HTMLInputElement).checked) return CtrlLayerEnum.Show;
        if ((document.getElementById('sbj-ctrl-layer-option-3') as HTMLInputElement).checked) return CtrlLayerEnum.Hide;
        return CtrlLayerEnum.Overlay;
    }


    /**
     * 
     */
    public set CtrlLayerMode(value: CtrlLayerEnum) {

        for (let i = 1; i <= 3; i++) {
            let s = i.toString();
            let inputElement = 'sbj-ctrl-layer-option-' + s;
            let labelElement = 'sbj-ctrl-layer-option-label-' + s;
            let checked = (value && value.toString() === s);
            MdlUtil.SetChecked(inputElement, labelElement, checked);
        }

    }


    /**
     * 
     * @param ps 
     */
    public SetPageSettings(ps: PageSettings) {

        if (!ps) {
            ps = new PageSettings();
        }

        this.CtrlLayerMode = ps.ctrlLayerMode;

        (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked = ps.isAspectFix;
        MdlUtil.SetChecked('sbj-check-aspect-disp', 'sbj-check-aspect-disp-label', ps.isAspectFix);
        (document.getElementById('sbj-aspect-width') as HTMLInputElement).value = ps.aspectW.toString();
        (document.getElementById('sbj-aspect-height') as HTMLInputElement).value = ps.aspectH.toString();
        MdlUtil.SetTextField('sbj-livehtml-value-name', 'sbj-livehtml-value-name-field', ps.pageName, true);
        MdlUtil.SetTextField('sbj-livehtml-value-tag', 'sbj-livehtml-value-tag-field', ps.pageTag);
        MdlUtil.SetTextField('sbj-livehtml-value-chatlinkage', 'sbj-livehtml-value-chatlink-field', ps.chatLinkage);
        (document.getElementById('sbj-livehtml-value-layer1') as HTMLInputElement).value = ps.layerBackgroundB;
        (document.getElementById('sbj-livehtml-value-layer2') as HTMLInputElement).value = ps.layerBackgroundF;
        (document.getElementById('sbj-livehtml-value-layer3') as HTMLInputElement).value = ps.layerActive;
        (document.getElementById('sbj-livehtml-value-layer4') as HTMLInputElement).value = ps.layerControl;
        this.ChangeAspectFixed(ps);
        this.ChangeHTML(ps);
        this.CheckChangeSaveDisable(true);
    }


    /**
     * レイヤ情報の変更時イベント
     */
    public ChangeHTML(dom: PageSettings) {

        let layer1 = $("#sbj-backgroundB-layer");
        let layer2 = $("#sbj-backgroundF-layer");
        let layer3 = $("#sbj-active-layer");
        let layer4 = $("#sbj-cotrol-layer");

        let mainHeight = (PageSettings.HasCtrl(dom) ? "calc(100% - 52px)" : "100%");
        layer1.height(mainHeight);
        layer2.height(mainHeight);
        layer3.height(mainHeight);

        if (this._previewPageSetting) {
            this.CheckChangeLayerHTML(layer1, this._previewPageSetting.layerBackgroundB, dom.layerBackgroundB);
            this.CheckChangeLayerHTML(layer2, this._previewPageSetting.layerBackgroundF, dom.layerBackgroundF);
            this.CheckChangeLayerHTML(layer3, this._previewPageSetting.layerActive, dom.layerActive);
            this.CheckChangeLayerHTML(layer4, this._previewPageSetting.layerControl, dom.layerControl);
            this._previewPageSetting = dom;
        }
        else {
            layer1.empty();
            layer2.empty();
            layer3.empty();
            layer4.empty();
        }

        this.ChangeAspect(dom);
    }


    /**
     * 
     * @param layer 
     * @param pre 
     * @param cur 
     */
    public CheckChangeLayerHTML(layer: JQuery, pre: string, cur: string) {
        if (pre === cur) {
            return;
        }
        let html = PageSettings.ReplasePeerId(cur, this._controller.SwPeer.PeerId);
        layer.empty().append(html);
    }


    /**
     * 
     */
    public ChangeAspectFixed(dom: PageSettings) {

        let aspectFixed = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;

        if (!aspectFixed) {
            dom.aspectW = 4;
            dom.aspectH = 3;
        }

        this.ChangeAspect(dom);
    }


    /**
     * アスペクト比の変更
     */
    public ChangeAspect(ps: PageSettings) {
        let content = document.getElementById('sbj-livehtml-content') as HTMLElement;

        let _ctlSize = (PageSettings.HasCtrl(ps) ? 52 : 0);
        let _mpx = 480;

        let aspect = ps.aspectW / ps.aspectH;

        if (aspect === 1) {
            content.style.width = _mpx + "px";
            content.style.height = (_mpx + _ctlSize) + "px";
        }
        else if (aspect < 1) {
            let width = (_mpx * ps.aspectW / ps.aspectH);
            content.style.width = width + "px";
            content.style.height = (_mpx + _ctlSize) + "px";
        }
        else {
            let height = (_mpx * ps.aspectH / ps.aspectW);
            content.style.width = _mpx + "px";
            content.style.height = (height + _ctlSize) + "px";
        }

        if (this._controller.View.Cursor) {
            this._controller.View.Cursor.DisplayAll();
        }

    }


    /**
     * 
     */
    public Save() {
        let ps = this.GetPageSettings();

        this._controller.Model.UpdatePageSettings(ps, () => {
            this.SetSelect(ps);
            this._controller.View.UpdateLive();
            this.SetEditTitle('ページの編集', '更新');
            this.CheckChangeSaveDisable(true);
        })
    }


    /**
     * 
     * @param isSave 
     */
    public Close() {
        this._controller.View.ChangeDisplayEditMode(false);
        this.SetPageSettings(null);
    }


    public IsSelect(): boolean {
        if (this._selectPageSetting && this._selectPageSetting.pageId) {
            return true;
        }
        else {
            return false;
        }
    }


    public SetSelect(sel: PageSettings) {
        this._selectPageSetting = sel;

        let isAnySelect = (sel && sel.pageId.length > 0);
        let isLivePage = (sel && sel.pageId === this._controller.View.LivePageId);
        (document.getElementById('sbj-livehtml-page-copy') as HTMLInputElement).disabled = !isAnySelect;
        (document.getElementById('sbj-livehtml-page-edit') as HTMLInputElement).disabled = !isAnySelect;
        (document.getElementById('sbj-livehtml-page-delete') as HTMLInputElement).disabled = !isAnySelect;
    }


    public GetSelect(): PageSettings {
        if (!this._selectPageSetting) {
            this._selectPageSetting = new PageSettings();
        }
        return this._selectPageSetting;
    }


    /**
     * 
     * @param title 
     * @param bottonTitle 
     */
    public SetEditTitle(title: string, bottonTitle: string) {
        let element = document.getElementById('sbj-livehtml-edit-title');
        element.textContent = title;
        let saveButton = document.getElementById('sbj-livehtml-pagesettings-save-label');
        if (saveButton.textContent !== bottonTitle) {
            saveButton.textContent = bottonTitle;
        }
        let saveCloseButton = document.getElementById('sbj-livehtml-pagesettings-save-close-label');

        if (saveCloseButton.textContent !== bottonTitle) {
            saveCloseButton.textContent = bottonTitle;
        }
    }


    /**
     * 
     */
    public OnClickPageAdd() {

        let newPage = new PageSettings();
        newPage.pageId = StdUtil.UniqKey();
        newPage.isAspectFix = true;
        newPage.ctrlLayerMode = CtrlLayerEnum.Overlay;
        newPage.aspectW = 4;
        newPage.aspectH = 3;

        this.SetPageSettings(newPage);

        this.SetEditTitle('ページの追加', '追加');
        this._controller.View.ChangeDisplayEditMode(true);
    }


    /**
     * 
     */
    public OnClickPageCopy() {
        if (this.IsSelect()) {
            let pageId = this._selectPageSetting.pageId;
            this._controller.Model.GetPageSettings(pageId, (newPage) => {
                newPage.pageId = StdUtil.UniqKey();
                newPage.pageName = newPage.pageName + "のコピー";
                this.SetPageSettings(newPage);
                this.SetEditTitle('ページのコピー', '追加');
                this._controller.View.ChangeDisplayEditMode(true);

                //  コピーの場合は最初から保存可能にする
                this.CheckChangeSaveDisable();
            })
        }
    }


    /**
     * 
     */
    public OnClickPageEdit() {
        if (this.IsSelect()) {
            this.SetPageSettings(this._selectPageSetting);
            this.SetEditTitle('ページの編集', '更新');
            this._controller.View.ChangeDisplayEditMode(true);
        }
    }


    /**
     * 
     */
    public OnClickPageDelete() {

        if (this.IsSelect()) {
            if (window.confirm('削除したページ設定は元に戻せません。\n削除してよろしいですか？')) {
                this._controller.Model.DeletePageSettings(this._selectPageSetting, () => {
                    this.SetSelect(null);
                    this._controller.View.ChangeDisplayEditMode(false);
                })
            }
        }
    }


    /**
     * グループ通話機能の設置URL
     */
    public SetVoiceChatHTML() {

        let url = LinkUtil.CreateLink("../VoiceChat/") + "?k={key}&p={peer}&sfu=0";

        let element = (document.getElementById('sbj-livehtml-value-layer4') as HTMLInputElement);
        element.value = "<iframe class='voicechat' src='" + url + "'/>";

        this.ChangeHTML(this.GetPageSettings());
        this.CheckChangeSaveDisable();
    }

}

