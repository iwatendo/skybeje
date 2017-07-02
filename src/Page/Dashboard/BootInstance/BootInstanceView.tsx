import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import LocalCache from "../../../Base/Common/LocalCache";
import LinkUtil from "../../../Base/Util/LinkUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";

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

        this._owner.Model.GetEntrances((rooms) => {
            let bootDuplication = (LocalCache.BootHomeInstancePeerID ? true : false);
            this.Initialize(rooms, bootDuplication);
        });
    }


    /**
     * 
     * @param rooms 
     */
    private Initialize(rooms: Array<Home.Room>, bootDuplication: boolean) {

        let key = StdUtil.CreateUuid();
        ReactDOM.render(<BootInstanceComponent key={key} controller={this} rooms={rooms} bootDuplication={bootDuplication} />, this._element, () => {
            if (rooms && rooms.length > 0) {
                this.SetImageCss(rooms[0]);
            }
        });
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



    public SetImageCss(info: Home.Room) {
        ImageInfo.SetCss('sbj-split-right-img', info.background);
    }


    /**
     * ホームインスタンスの起動
     * @param hid 
     * @param isForce 
     */
    public StartHomeInstance(hid: string, isForce: boolean) {

        if (!isForce && LocalCache.BootHomeInstancePeerID) {
            this.Refresh();
        } else {
            let url = LinkUtil.CreateLink('../HomeInstance/?hid=' + hid);
            this._owner.View.StartHomeInstance(url);
        }
    }

}

