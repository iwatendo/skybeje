import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ImageInfo from "../../../Base/Container/ImageInfo";
import ImageUtil from "../../../Base/Util/ImageUtil";

import DashboardController from "../DashboardController";
import { INaviContainer, DragAction } from "../INaviContainer";
import ProfileComponent from "./ProfileComponent";


/**
 * 
 */
export default class ProfileView implements INaviContainer {

    private _owner: DashboardController;
    private _element: HTMLElement;
    private _dragFromOutSizeAction: DragAction;


    /**
     * コンストラクタ
     * @param owner 
     * @param element 
     */
    public constructor(owner: DashboardController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;

        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {

        this._owner.Model.GetUserProfileInfo((profile, icons) => {

            ReactDOM.render(<ProfileComponent controller={this._owner} view={this} actor={profile} icons={icons} />, this._element, () => {
                icons.map((icon) => {
                    ImageInfo.SetCss(icon.iid, icon.img);
                });
            });

        });
    }

    /**
     * 外部データのドラックイベント時に呼ばれる処理の設定
     * @param action 
     */
    public SetDragFromOutsideAction(action: DragAction) {
        this._dragFromOutSizeAction = action;
    }


    /**
     * 外部データのドラック時のイベント処理
     * @param event 
     */
    public OnDragFromOutside(event: DragEvent) {
        if (ImageUtil.IsImageDrag(event)) {
            this._dragFromOutSizeAction();
        }
    }

}