import * as JQuery from "jquery";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LiveHTMLInstanceController from '../LiveHTMLInstanceController';
import PageSettingsComponent from './PageSettingsComponent';
import { PageSettings } from '../../../Contents/IndexedDB/LiveHTML';
import StdUtil from "../../../Base/Util/StdUtil";
import MdlUtil from "../../../Contents/Util/MdlUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";


/**
 * 
 */
export default class PageSettingsController {

    private _element: HTMLElement;
    private _controller: LiveHTMLInstanceController;
    private _previewPageSetting: PageSettings;
    private _selectPageSetting: PageSettings;


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
            if (e.keyCode === 27) { this.Close(false); }
        }

        document.getElementById('sbj-livehtml-page-edit-close').onclick = (e) => { this.Close(false); }
        document.getElementById('sbj-livehtml-pagesettings-cancel').onclick = (e) => { this.Close(false); }
        document.getElementById('sbj-livehtml-pagesettings-save').onclick = (e) => { this.Close(true); }

        //  編集ボタン郡
        document.getElementById('sbj-livehtml-page-add').onclick = (e) => { this.OnClickPageAdd() };
        document.getElementById('sbj-livehtml-page-copy').onclick = (e) => { this.OnClickPageCopy() };
        document.getElementById('sbj-livehtml-page-edit').onclick = (e) => { this.OnClickPageEdit() };
        document.getElementById('sbj-livehtml-page-delete').onclick = (e) => { this.OnClickPageDelete() };

        //  アスペクト比率の指定有無
        document.getElementById('sbj-check-aspect-disp').onchange = (e) => {
            this.ChangeAspectFixed(this.GetPageSettings());
        }

        //  アスペクト比変更時
        document.getElementById('sbj-aspect-width').oninput = (e) => {
            this.ChangeAspect(this.GetPageSettings());
        }
        document.getElementById('sbj-aspect-height').oninput = (e) => {
            this.ChangeAspect(this.GetPageSettings());
        }

        //  コントロールレイヤーの表示有無
        document.getElementById('sbj-check-control-disp').onchange = (e) => {

        };

        //  ページ名称変更イベント
        document.getElementById('sbj-embedded-value-name').oninput = (e) => {
            this.CheckPageName();
        };

        //  レイヤー設定変更
        for (let i = 1; i <= 4; i++) {
            document.getElementById('sbj-embedded-value-layer' + i.toString()).onchange = (ev) => {
                this.ChangeHTML(this.GetPageSettings());
            }
        }

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
            //  選択行
            let select = (this._selectPageSetting ? this._selectPageSetting.pageId : "");

            ReactDOM.render(<PageSettingsComponent controller={this._controller} items={pss} selectItem={select} />, this._element, () => {
            });
        });
    }


    /**
     * ページ設定のソート用関数
     * @param a 
     * @param b 
     */
    public PageSettingCompare(a: PageSettings, b: PageSettings): number {
        if (a.pageName < b.pageName) return -1;
        if (a.pageName > b.pageName) return 1;
        if (a.pageTag < b.pageTag) return -1;
        if (a.pageTag > b.pageTag) return 1;
        return 0;
    }


    /**
     * ページ名称の入力チェック
     */
    public CheckPageName() {

        let value = (document.getElementById('sbj-embedded-value-name') as HTMLInputElement).value;

        //  ページ名が設定されていない場合、更新ボタンを押せないようにする
        let button = document.getElementById('sbj-livehtml-pagesettings-save') as HTMLButtonElement;
        button.disabled = (value.length === 0);
    }


    /**
     * 
     */
    public GetPageSettings(): PageSettings {
        let sender = new PageSettings();

        sender.pageId = this._previewPageSetting.pageId;
        sender.pageName = (document.getElementById('sbj-embedded-value-name') as HTMLInputElement).value;
        sender.pageTag = (document.getElementById('sbj-embedded-value-tag') as HTMLInputElement).value;
        sender.isDispControlLayer = (document.getElementById('sbj-check-control-disp') as HTMLInputElement).checked;
        sender.isAspectFix = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;
        sender.aspectW = Number.parseInt((document.getElementById('sbj-aspect-width') as HTMLInputElement).value);
        sender.aspectH = Number.parseInt((document.getElementById('sbj-aspect-height') as HTMLInputElement).value);
        sender.layerBackgroundB = (document.getElementById('sbj-embedded-value-layer1') as HTMLInputElement).value;
        sender.layerBackgroundF = (document.getElementById('sbj-embedded-value-layer2') as HTMLInputElement).value;
        sender.layerActive = (document.getElementById('sbj-embedded-value-layer3') as HTMLInputElement).value;
        sender.layerControl = (document.getElementById('sbj-embedded-value-layer4') as HTMLInputElement).value;
        return sender;
    }


    /**
     * 
     * @param ps 
     */
    public SetPageSettings(ps: PageSettings) {

        if (!ps) {
            ps = new PageSettings();
        }

        (document.getElementById('sbj-check-control-disp') as HTMLInputElement).checked = ps.isDispControlLayer;
        MdlUtil.SetChecked('sbj-check-control-disp', 'sbj-check-control-disp-label', ps.isDispControlLayer);
        (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked = ps.isAspectFix;
        MdlUtil.SetChecked('sbj-check-aspect-disp', 'sbj-check-aspect-disp-label', ps.isAspectFix);
        (document.getElementById('sbj-aspect-width') as HTMLInputElement).value = ps.aspectW.toString();
        (document.getElementById('sbj-aspect-height') as HTMLInputElement).value = ps.aspectH.toString();

        (document.getElementById('sbj-embedded-value-name') as HTMLInputElement).value = ps.pageName;
        (document.getElementById('sbj-embedded-value-tag') as HTMLInputElement).value = ps.pageTag;
        if (ps.pageName && ps.pageName.length > 0) {
            document.getElementById('sbj-embedded-value-name-field').classList.remove('is-invalid');
            document.getElementById('sbj-embedded-value-name-field').classList.add('is-dirty');
        }
        else {
            document.getElementById('sbj-embedded-value-name-field').classList.add('is-invalid');
            document.getElementById('sbj-embedded-value-name-field').classList.remove('is-dirty');
        }
        if (ps.pageTag && ps.pageTag.length > 0) {
            document.getElementById('sbj-embedded-value-tag-field').classList.add('is-dirty');
        }
        else {
            document.getElementById('sbj-embedded-value-tag-field').classList.remove('is-dirty');
        }

        (document.getElementById('sbj-embedded-value-layer1') as HTMLInputElement).value = ps.layerBackgroundB;
        (document.getElementById('sbj-embedded-value-layer2') as HTMLInputElement).value = ps.layerBackgroundF;
        (document.getElementById('sbj-embedded-value-layer3') as HTMLInputElement).value = ps.layerActive;
        (document.getElementById('sbj-embedded-value-layer4') as HTMLInputElement).value = ps.layerControl;
        this.ChangeAspectFixed(ps);
        this.ChangeHTML(ps);
        this.CheckPageName();
    }


    /**
     * レイヤー情報の変更時イベント
     */
    public ChangeHTML(dom: PageSettings) {

        let layer1 = $("#sbj-livehtml-layer1");
        let layer2 = $("#sbj-livehtml-layer2");
        let layer3 = $("#sbj-livehtml-layer3");
        let layer4 = $("#sbj-livehtml-layer4");

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
    public ChangeAspect(dom: PageSettings) {
        let content = document.getElementById('sbj-livehtml-content') as HTMLElement;

        let aspect = dom.aspectW / dom.aspectH;

        if (aspect === 1) {
            content.style.width = "100%";
            content.style.height = "100%";
        }
        else if (aspect < 1) {
            let width = (480 * dom.aspectW / dom.aspectH);
            content.style.width = width.toString(); + "px";
            content.style.height = "100%";
        }
        else {
            let height = (480 * dom.aspectH / dom.aspectW);
            content.style.width = "100%";
            content.style.height = height.toString() + "px";
        }

        if (this._controller.View.Cursor) {
            this._controller.View.Cursor.DisplayAll();
        }

    }


    /**
     * 
     * @param isSave 
     */
    public Close(isSave: boolean) {
        if (isSave) {
            let ps = this.GetPageSettings();

            this._controller.Model.UpdatePageSettings(ps, () => {
                this.SetSelect(ps);
                this._controller.View.ChangeDisplayEditMode(false);
                this.SetPageSettings(null);
            })
        }
        else {
            this._controller.View.ChangeDisplayEditMode(false);
            this.SetPageSettings(null);
        }
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

        let seldisp = !(sel && sel.pageId.length > 0);
        document.getElementById('sbj-livehtml-page-copy').hidden = seldisp;
        document.getElementById('sbj-livehtml-page-edit').hidden = seldisp;
        document.getElementById('sbj-livehtml-page-delete').hidden = seldisp;
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
        let button = document.getElementById('sbj-livehtml-pagesettings-done');
        button.textContent = bottonTitle;
    }


    /**
     * 
     */
    public OnClickPageAdd() {

        let newPage = new PageSettings();
        newPage.pageId = StdUtil.UniqKey();
        newPage.isAspectFix = true;
        newPage.isDispControlLayer = true;
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
                this.SetPageSettings(newPage);
                this.SetEditTitle('ページの複製', '追加');
                this._controller.View.ChangeDisplayEditMode(true);
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

}

