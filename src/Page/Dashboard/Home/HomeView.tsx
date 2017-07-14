import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import ImageUtil from "../../../Base/Util/ImageUtil";
import * as Home from "../../../Base/IndexedDB/Home";

import { INaviContainer, DragAction } from "../INaviContainer";
import HomeComponent from "./HomeComponent";
import DashboardController from "../DashboardController";

/**
 * 
 */
export default abstract class HomeView implements INaviContainer {

    private _owner: DashboardController;
    private _element: HTMLElement;
    private _dragFromOutSizeAction: DragAction;


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

        this._owner.Model.GetRooms((rooms) => {
            this.Initialize(rooms);
        });
    }


    /**
     * 
     * @param rooms 
     */
    private Initialize(rooms: Array<Home.Room>) {

        let key = StdUtil.CreateUuid();
        ReactDOM.render(<HomeComponent key={key} btnTitle={this.GetAddBtnTitle()} controller={this} rooms={rooms} />, this._element, () => {
            if (rooms && rooms.length > 0) {
                this.SetImageCss(rooms[0]);
            }
        });
    }


    /**
     * 更新処理
     * @param info 
     */
    public UpdateRoom(info: Home.Room) {
        this._owner.Model.UpdateRoom(info);
    }


    /**
     * 削除処理
     * @param info 
     */
    public DeleteRoom(info: Home.Room) {

        this._owner.Model.DeleteRoom(info);

        ImageInfo.SetCss('sbj-split-right-img', new ImageInfo());
    }


    public SetImageCss(info: Home.Room) {
        ImageInfo.SetCss('sbj-split-right-img', info.background);
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
        if (ImageUtil.IsImageDrag(event)) {
            this._dragFromOutSizeAction();
        }
    }


    public abstract IsEntrance(): boolean;


    public abstract GetAddBtnTitle(): string;


    public abstract GetAppendModeDialogTitle(): string;


    public abstract GetEditModeDialogTitle(): string;


}

