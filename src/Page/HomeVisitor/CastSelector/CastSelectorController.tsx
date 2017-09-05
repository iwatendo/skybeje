
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServantCache from "../Cache/ServantCache";
import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import ActorCache from "../Cache/ActorCache";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";


export default class CastSelectorController {

    private _FrameCount = 4;

    private _castctrlpaneElement = document.getElementById('sbj-home-visitor-castctrl-pane');
    private _ownerController: HomeVisitorController;
    private _selectServant: string;
    private _servantMap = new Map<number, string>();


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {

        this._ownerController = controller;

        for (let i = 0; i < this._FrameCount; i++) {
            let element = this.GetFrmaeElement(i);
            element.onload = (ev) => { this.NotifyServantToActor(element); }
        }
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
    private GetTabElement(index: number) {
        return document.getElementById("sbj-home-visitor-tab-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetTabTitleElement(index: number) {
        return document.getElementById("sbj-home-visitor-tab-title-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetTabIconElement(index: number) {
        return document.getElementById("sbj-home-visitor-tab-icon-" + index.toString());
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
                    this.SetServantTab(i, null);
                    this._servantMap.delete(i);
                }
            }

            //  新規サーバントの追加
            newServant.forEach((servant) => {
                for (let i = 0; i < this._FrameCount; i++) {
                    if (preMap.has(i))
                        continue;

                    this.SetServantTab(i, servant);
                    preMap.set(i, servant);
                    this._servantMap.set(i, servant.clientUrl);
                    i = this._FrameCount;
                }
            });
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
    public SetServantTab(index: number, servant: ServantSender) {

        let frameElement = this.GetFrmaeElement(index);
        let tabElement = this.GetTabElement(index);
        let tabTitleElement = this.GetTabTitleElement(index);
        let tabIconElement = this.GetTabIconElement(index);

        if (servant) {
            this.SetTabName(tabTitleElement, tabIconElement, servant);
            tabElement.hidden = false;
            this.SetServant(frameElement, servant);
        }
        else {
            tabElement.hidden = true;
            frameElement.setAttribute('src', '');
        }
    }


    /**
     * 
     * @param tabTitleElement 
     * @param tabIconElement 
     * @param servant 
     */
    public SetTabName(tabTitleElement: HTMLElement, tabIconElement: HTMLElement, servant: ServantSender) {
        this._ownerController.ActorCache.GetActor(servant.ownerPeerid, servant.ownerAid, (actor) => {
            tabTitleElement.textContent = actor.name;
            tabIconElement.textContent = this.GetCastIconName(servant.castType);
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

}