
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServantCache from "../Cache/ServantCache";
import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import ActorCache from "../Cache/ActorCache";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";


export default class CastSelectorController {

    private _FrameCount = 4;

    private _castSelectorElement = document.getElementById('sbj-home-visitor-castselect-pane');
    private _castFrameElement = document.getElementById('sbj-home-visitor-castfrmae-pane');

    private _layoutButton = document.getElementById('sbj-home-visitor-livecast-layout');
    private _layoutButton1 = document.getElementById('sbj-home-visitor-livecast-layout-1');
    private _layoutButton2 = document.getElementById('sbj-home-visitor-livecast-layout-2');



    private _ownerController: HomeVisitorController;
    private _selectServant: string;
    private _servantMap = new Map<number, string>();

    private _isDispMenu = true;
    private _dispFrameCount = 1;
    private _dispFrameArray = new Array<number>();

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {

        this._ownerController = controller;

        for (let i = 0; i < this._FrameCount; i++) {
            let button = this.GetSelectButtonElement(i);
            let element = this.GetFrmaeElement(i);
            element.onload = (ev) => { this.NotifyServantToActor(element); }

            button.onclick = (ev) => {
                let index = i;
                this.LiveCastSelectClick(index);
            }

        }

        this._layoutButton.onclick = (ev) => { this.ChangeLayout() };
        this._layoutButton1.onclick = (ev) => { this.SetLiveCastLayout(1); };
        this._layoutButton2.onclick = (ev) => { this.SetLiveCastLayout(2); };

    }


    /**
     * 
     * @param index 
     */
    private GetFrmaeElement(index: number): HTMLFrameElement {
        return document.getElementById("sbj-home-visitor-livecast-" + index.toString()) as HTMLFrameElement;
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonTitleElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-title-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonIconElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-icon-" + index.toString());
    }




    /**
     * 部屋変更に伴うサーバント一覧の変更
     * @param hid 
     */
    public ChangeRoom(hid: string) {
        this._ownerController.ServantCache.GetRoomServant(hid, (rs) => {
            this.ChangeRoomServantList(rs);
        });
    }


    /**
     * サーバント一覧表示の切替
     * @param url 
     */
    public ChangeRoomServantList(rs: RoomServantSender) {

        let newServant = new Array<ServantSender>();
        let preMap = new Map<number, ServantSender>();

        if (rs.servants) {

            //  設置済みのサーバント判定
            rs.servants.forEach((servant) => {
                let preIndex = this.GetServantPos(servant);
                if (preIndex >= 0) {
                    preMap.set(preIndex, servant);
                }
                else {
                    newServant.push(servant);
                }
            });

            //  削除されたサーバントの除去
            for (let i = 0; i < this._FrameCount; i++) {
                if (!preMap.has(i)) {
                    this.SetServantFrame(i, null);
                    this._servantMap.delete(i);
                }
            }

            //  新規サーバントの追加
            newServant.forEach((servant) => {
                for (let i = 0; i < this._FrameCount; i++) {
                    if (preMap.has(i))
                        continue;

                    this.SetServantFrame(i, servant);
                    preMap.set(i, servant);
                    this._servantMap.set(i, servant.clientUrl);
                    i = this._FrameCount;
                }
            });

            //  アクティブタブの確認
            this.CheckChangeActiveFrame();
        }
    }


    /**
     * 指定されたサーバントが含まれているか？
     * @param servant 
     */
    private GetServantPos(servant: ServantSender): number {

        let result = -1;

        this._servantMap.forEach((url, index) => {
            if (servant.clientUrl === url) {
                result = index;
            }
        });
        return result;
    }


    /**
     * 
     * @param index 
     * @param servant 
     */
    public SetServantFrame(index: number, servant: ServantSender) {

        let frameElement = this.GetFrmaeElement(index);
        let btnElement = this.GetSelectButtonElement(index);
        let btnTitleElement = this.GetSelectButtonTitleElement(index);
        let btnIconElement = this.GetSelectButtonIconElement(index);


        if (servant) {
            this.SetTabName(btnTitleElement, btnIconElement, servant);
            btnElement.hidden = false;
            this.SetServant(frameElement, servant);

            if (this._dispFrameCount < this._dispFrameArray.length) {
                this._dispFrameArray.push(index);
                this.SetCastFrame();
            }

        }
        else {
            btnElement.hidden = true;
            frameElement.setAttribute('src', '');
            this._dispFrameArray = this._dispFrameArray.filter((pre) => pre !== index);
            this.SetCastFrame();
        }
    }


    /**
     * 
     * @param btnTitleElement 
     * @param btnIconElement 
     * @param servant 
     */
    public SetTabName(btnTitleElement: HTMLElement, btnIconElement: HTMLElement, servant: ServantSender) {
        this._ownerController.ActorCache.GetActor(servant.ownerPeerid, servant.ownerAid, (actor) => {
            btnTitleElement.textContent = actor.name;
            btnIconElement.textContent = this.GetCastIconName(servant.castType);
        });
    }


    /**
     * キャスト名称の取得
     * @param servant 
     */
    public GetCastIconName(castType: CastTypeEnum) {
        switch (castType) {
            case CastTypeEnum.LiveCast: return "videocam";
            case CastTypeEnum.ScreenShare: return "screen_share";
            case CastTypeEnum.Gadget: return "ondemand_video";
        }
    }


    /**
     * サーバントの表示切替
     * @param servant 
     */
    public SetServant(element: HTMLFrameElement, servant: ServantSender) {

        if (servant.hid !== this._ownerController.CurrentHid) {
            return;
        }

        this._selectServant = servant.servantPeerId;

        let url: string = servant.clientUrl;

        if (servant.ownerPeerid === this._ownerController.PeerId) {
            //  自分が起動したキャストの場合、ミュート状態で起動する
            url += "&mute=1";
        }

        //  URLの変更があった場合、設定
        let preUrl = element.getAttribute('src');

        if (preUrl !== url) {
            element.onload = (e) => {
                //  エンターキー押下時に、テキストボックスにフォーカスが移るようにする
                element.contentDocument.onkeyup = this._ownerController.View.InputPane.OnOtherKeyPress;

                element.contentDocument.onmouseover = (e) => {
                    element.contentWindow.document.body.focus();
                }
                this._ownerController.View.CastSelector.NotifyServantToActor(element);
            }
            element.setAttribute('src', url);
        }

    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServantToActor(element: HTMLFrameElement) {

        if (element) {
            let childDocument = element.contentDocument;
            let peerElement = childDocument.getElementById("peerid");
            let aidElement = childDocument.getElementById("aid");
            let iidElement = childDocument.getElementById("iid");

            if (peerElement && aidElement && iidElement) {
                peerElement.textContent = this._ownerController.PeerId;
                aidElement.textContent = this._ownerController.CurrentAid;
                iidElement.textContent = this._ownerController.CurrentActor.dispIid;
            }
        }
    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServantToActorAll() {
        for (let i = 0; i < this._FrameCount; i++) {
            this.NotifyServantToActor(this.GetFrmaeElement(i));
        }
    }


    /**
     * 表示するライブキャストのボタン
     * @param index 
     */
    private LiveCastSelectClick(index: number) {

        let isDisp = false;

        this._dispFrameArray.forEach((pre) => {
            if (pre === index) {
                isDisp = true;
            }
        });

        //  表示済みの場合は何も処理しない
        if (isDisp)
            return;

        //  未表示キャストが選択された場合は最後尾に追加
        this._dispFrameArray.push(index);

        if (this._dispFrameArray.length > this._dispFrameCount) {
            this._dispFrameArray = this._dispFrameArray.slice(1);
        }

        this.SetCastFrame();
    }


    /**
     * レイアウト変更
     */
    private ChangeLayout() {
        this._isDispMenu = !this._isDispMenu;
        let isMenuHide = !this._isDispMenu;

        this._castSelectorElement.hidden = isMenuHide;
        this._layoutButton1.hidden = isMenuHide;
        this._layoutButton2.hidden = isMenuHide;
        let xpx = (this._isDispMenu ? 64 : 8).toString() + "px";
        let ypx = (this._isDispMenu ? 48 : 8).toString() + "px";
        this._castFrameElement.style.left = xpx;
        this._castFrameElement.style.top = ypx;
        this._castFrameElement.style.width = "calc(100% - " + xpx + ")"
        this._castFrameElement.style.height = "calc(100% - " + ypx + ")"
    }


    /**
     * 
     * @param count 
     */
    private SetLiveCastLayout(count: number) {
        this._dispFrameCount = count;
        this._dispFrameArray = this._dispFrameArray.slice(0, count);

        while (this._dispFrameArray.length < this._dispFrameCount) {
            let index = this.GetNoDispFrameIndex();
            if (index >= 0) {
                this._dispFrameArray.push(index);
            }
            else {
                break;
            }
        }

        this.SetCastFrame();
    }


    /**
     * キャスト中かつ非表示のフレーム番号を取得
     */
    private GetNoDispFrameIndex(): number {

        for (let i = 0; i < this._FrameCount; i++) {
            let frameElement = this.GetFrmaeElement(i);
            let isCast = (frameElement.src.length > 0);

            if (isCast) {
                let pre = this._dispFrameArray.filter(n => (n === i));

                if (pre.length === 0) {
                    return i;
                }
            }
        }

        return -1;
    }


    /**
     * 
     */
    private SetCastFrame() {

        for (let i = 0; i < this._FrameCount; i++) {
            let frameElement = this.GetFrmaeElement(i);
            frameElement.hidden = true;
        }

        let persent = 100 / this._dispFrameArray.length;

        for (let i = 0; i < this._dispFrameArray.length; i++) {
            let frameElement = this.GetFrmaeElement(this._dispFrameArray[i]);
            frameElement.hidden = false;
            frameElement.style.height = "calc(" + persent.toString() + "% - 8px)";
        }

    }


    /**
     * アクティブボタンが閉じられた場合、表示されている先頭タブをアクティブにする
     */
    public CheckChangeActiveFrame() {

        let first: HTMLElement = null;

        for (let i = 0; i < this._FrameCount; i++) {

            let frame = this.GetFrmaeElement(i);
            let button = this.GetSelectButtonElement(i);

            if (button.hidden)
                continue;

            if (!frame.hidden) {
                return;
            }

            if (!first)
                first = button;
        }

        if (first)
            first.click();
    }

}