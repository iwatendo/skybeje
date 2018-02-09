import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Contents/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";

import { INaviContainer, DragAction } from "../INaviContainer";
import DashboardController from "../DashboardController";
import ProfileComponent from "./ProfileComponent";
import ImageUtil from "../../../Base/Util/ImageUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";

/**
 * 
 */
export default class ProfileView implements INaviContainer {

    private _owner: DashboardController;
    private _element: HTMLElement;
    private _dragFromOutSizeAction: DragAction;

    private _profileSelectionIconElement = document.getElementById('sbj-profile-selection-icon') as HTMLInputElement;
    private _profileDoCloseElement = document.getElementById('sbj-profile-do-close') as HTMLInputElement;
    private _hoveVisitorIdElement = document.getElementById('sbj-main-home-visitor-id') as HTMLInputElement;
    private _editCallback;

    /**
     * 
     */
    public constructor(owner: DashboardController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;
        this.Refresh();

        //  プロフィール画面からのアイコン変更通知
        this._profileSelectionIconElement.onclick = (e) => {
        };

        //  プロフィール画面からのダイアログクローズ通知
        this._profileDoCloseElement.onclick = (e) => {
            document.getElementById('sbj-profile-frame').hidden = true;
            if (this._editCallback) {
                this._editCallback();
            }
        }

    }


    /**
     * 
     */
    public DoShoActorEditDialog(aid: string, callback) {

        let controller = this._owner;

        controller.Model.GetUserProfile((userProfile) => {
            let frame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;
            let src = LinkUtil.CreateLink("../Profile/") + "?aid=" + aid;
            this._editCallback = callback;

            frame.onload = (e) => {
                frame.hidden = false;
                frame.onload = null;
            };
            frame.src = src;
        });
    }


    /**
     * 
     */
    public Refresh() {

        let isConnected = (this._hoveVisitorIdElement.textContent.length > 0);

        this._owner.Model.GetActors((actors) => {
            let key = StdUtil.CreateUuid();
            ReactDOM.render(<ProfileComponent key={key} controller={this._owner} view={this} isConnected={isConnected} actors={actors} />, this._element, () => {
                this.SetIconImageCss(actors);
                document.getElementById('sbj-dashboard-profile-back').focus();
            });
        });
    }


    /**
     * 
     * @param actors 
     */
    public SetIconImageCss(actors: Array<Personal.Actor>) {

        actors.map((actor) => {

            let iid = actor.dispIid;
            if (iid) {
                this._owner.Model.GetIcon(iid, (icon) => {
                    ImageInfo.SetCss("sbj-icon-img-" + iid.toString(), icon.img);
                });
            }

        });
    }


    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
        this._dragFromOutSizeAction = action;
    }


    /**
     *  外部からのドラッグイベント時に呼ばれる処理
     */
    public OnDragFromOutside(event: DragEvent) {
        //  
    }

}

