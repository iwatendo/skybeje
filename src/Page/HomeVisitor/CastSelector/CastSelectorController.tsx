
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ServantCache from "../Cache/ServantCache";
import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import CastSelectorComponent from "./CastSelectorComponent";


export default class CastSelectorController {

    private _castElement = document.getElementById('sbj-home-visitor-livecast') as HTMLFrameElement;
    private _castctrlpaneElement = document.getElementById('sbj-home-visitor-castctrl-pane');
    private _ownerController: HomeVisitorController;
    private _selectServant: string;
    private _servantList = new Array<ServantSender>();


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._ownerController = controller;
        this.Create();

        this._castElement = document.getElementById('sbj-home-visitor-livecast') as HTMLFrameElement;
        this._castElement.onload = (ev) => {
            this.NotifyServantToActor();
        };
    }


    /**
     * 
     * @param servantList 
     */
    private Create() {
        ReactDOM.render(<CastSelectorComponent controller={this._ownerController} owner={this} servants={this._servantList} select={this._selectServant} />, this._castctrlpaneElement, () => {
        });
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

        this._servantList = rs.servants;

        if (this._servantList.length === 0) {
            this._selectServant = "";
            this._castElement.setAttribute('src', '');
            this.Create();
        }
        else {
            let preSelect = this._servantList.filter(n => n.servantPeerId === this._selectServant);
            if (preSelect.length === 0) {
                //  前回選択データが無い場合は１つ目を選択状態にする
                this.ChangeDispServant(this._servantList[0]);
            }
            else {
                //  前回選択データがある場合はそのまま描画
                this.Create();
            }
        }
    }


    /**
     * サーバントの表示切替
     * @param servant 
     */
    public ChangeDispServant(servant: ServantSender) {

        if (servant.hid !== this._ownerController.CurrentHid) {
            return;
        }

        this._selectServant = servant.servantPeerId;
        this.Create();

        let element = this._castElement;
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
                this._ownerController.View.CastSelector.NotifyServantToActor();
            }

            element.setAttribute('src', url);
        }

    }


    /**
     * サーバント側に使用アクターを通知
     */
    public NotifyServantToActor() {

        let element = this._castElement;

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

}