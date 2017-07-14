import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import LocalCache from "../../../Base/Common/LocalCache";

import DashboardController from "../DashboardController";
import { INaviContainer, DragAction } from "../INaviContainer";
import BootInstanceComponent from "./BootInstanceComponent";

/**
 * 
 */
export default class BootInstanceView implements INaviContainer {

    private _owner: DashboardController;
    private _element: HTMLElement;


    /**
     * 
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

        let bootDuplication = (LocalCache.BootHomeInstancePeerID ? true : false);
        ReactDOM.render(<BootInstanceComponent controller={this} bootDuplication={bootDuplication} />, this._element);
    }


    /**
     * 
     * @param event 
     */
    public OnDragFromOutside(event: DragEvent) {
    }


    /**
     * 
     * @param action 
     */
    public SetDragFromOutsideAction(action: DragAction) {
    }


    /**
     * ホームインスタンスの起動
     * @param hid 
     * @param isForce 
     */
    public StartHomeInstance(isForce: boolean) {

        if (!isForce && LocalCache.BootHomeInstancePeerID) {
            this.Refresh();
        } else {
            let url = LinkUtil.CreateLink('../HomeInstance/');
            this._owner.View.StartHomeInstance(url);
        }
    }

}

