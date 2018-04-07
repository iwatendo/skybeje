﻿import * as JQuery from "jquery";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LiveDomInstanceController from '../LiveDomInstanceController';
import PageSettingsComponent from './PageSettingsComponent';
import { PageSettings } from '../../../Contents/IndexedDB/LiveHTML';
import StdUtil from "../../../Base/Util/StdUtil";
import MdlUtil from "../../../Contents/Util/MdlUtil";


/**
 * 
 */
export default class PageSettingsController {

    private _element: HTMLElement;
    private _controller: LiveDomInstanceController;
    private _previewPageSetting: PageSettings;
    private _selectPageSetting: PageSettings;


    /**
     * 
     */
    public constructor(controller: LiveDomInstanceController, element: HTMLElement) {
        this._controller = controller;
        this._element = element;
        this._previewPageSetting = new PageSettings();
        this._selectPageSetting = new PageSettings();

        document.getElementById('sbj-livedom-pagesettings-cancel').onclick = (e) => { this.Close(false); }
        document.getElementById('sbj-livedom-pagesettings-save').onclick = (e) => { this.Close(true); }

        //  編集ボタン郡
        document.getElementById('sbj-livedom-page-add').onclick = (e) => { this.OnClickPageAdd() };
        document.getElementById('sbj-livedom-page-copy').onclick = (e) => { this.OnClickPageCopy() };
        document.getElementById('sbj-livedom-page-edit').onclick = (e) => { this.OnClickPageEdit() };
        document.getElementById('sbj-livedom-page-delete').onclick = (e) => { this.OnClickPageDelete() };

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

        //  アスペクト比率の指定有無
        document.getElementById('sbj-check-aspect-disp').onchange = (e) => {
            this.ChangeAspectFixed(this.GetPageSettings());
        }

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
            ReactDOM.render(<PageSettingsComponent controller={this._controller} items={pss} />, this._element, () => {
            });
        });
    }


    /**
     * 
     */
    public GetPageSettings(): PageSettings {
        let sender = new PageSettings();

        sender.pageId = this._previewPageSetting.pageId;
        sender.pageName = (document.getElementById('sbj-embedded-value-name') as HTMLInputElement).value;
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
        (document.getElementById('sbj-embedded-value-layer1') as HTMLInputElement).value = ps.layerBackgroundB;
        (document.getElementById('sbj-embedded-value-layer2') as HTMLInputElement).value = ps.layerBackgroundF;
        (document.getElementById('sbj-embedded-value-layer3') as HTMLInputElement).value = ps.layerActive;
        (document.getElementById('sbj-embedded-value-layer4') as HTMLInputElement).value = ps.layerControl;
        this.ChangeHTML(ps);
    }


    /**
     * レイヤー情報の変更時イベント
     */
    public ChangeHTML(dom: PageSettings) {

        if (this._previewPageSetting) {
            if (this._previewPageSetting.layerBackgroundB !== dom.layerBackgroundB) $("#sbj-livedom-layer1").empty().append(dom.layerBackgroundB);
            if (this._previewPageSetting.layerBackgroundF !== dom.layerBackgroundF) $("#sbj-livedom-layer2").empty().append(dom.layerBackgroundF);
            if (this._previewPageSetting.layerActive !== dom.layerActive) $("#sbj-livedom-layer3").empty().append(dom.layerActive);
            if (this._previewPageSetting.layerControl !== dom.layerControl) $("#sbj-livedom-layer4").empty().append(dom.layerControl);
            this._previewPageSetting = dom;
        }
        else {
            $("#sbj-livedom-layer1").empty();
            $("#sbj-livedom-layer2").empty();
            $("#sbj-livedom-layer3").empty();
            $("#sbj-livedom-layer4").empty();
        }
    }


    /**
     * 
     */
    public ChangeAspectFixed(dom: PageSettings) {

        let aspectFixed = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;
        document.getElementById('sbj-aspect-setting').hidden = !aspectFixed;

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
        document.getElementById('sbj-aspect-width-tip').textContent = dom.aspectW.toString();
        document.getElementById('sbj-aspect-height-tip').textContent = dom.aspectH.toString();
        let content = document.getElementById('sbj-livedom-content') as HTMLElement;

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
    }


    /**
     * 
     * @param isSave 
     */
    public Close(isSave: boolean) {
        if (isSave) {
            let ps = this.GetPageSettings();

            this._controller.Model.UpdatePageSettings(ps, () => {
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
        document.getElementById('sbj-livedom-page-copy').hidden = seldisp;
        document.getElementById('sbj-livedom-page-edit').hidden = seldisp;
        document.getElementById('sbj-livedom-page-delete').hidden = seldisp;
    }


    public GetSelect(): PageSettings {
        if (!this._selectPageSetting) {
            this._selectPageSetting = new PageSettings();
        }
        return this._selectPageSetting;
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
            this._controller.View.ChangeDisplayEditMode(true);
        }
    }


    /**
     * 
     */
    public OnClickPageDelete() {

        if (this.IsSelect()) {
            this._controller.Model.DeletePageSettings(this._selectPageSetting, () => {
                this.SetSelect(null);
                this._controller.View.ChangeDisplayEditMode(false);
            })
        }
    }

}

