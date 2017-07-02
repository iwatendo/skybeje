import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Base/IndexedDB/Personal";
import { INaviContainer, DragAction } from "../INaviContainer";
import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import ActorComponent from "./ActorComponent";
import ImageUtil from "../../../Base/Util/ImageUtil";
import DashboardController from "../DashboardController";

/**
 * 
 */
export default class ActorView implements INaviContainer {

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

        this._owner.Model.GetActorsInfo((actors, icons) => {
            let key = StdUtil.CreateUuid();
            ReactDOM.render(<ActorComponent key={key} controller={this._owner} view={this} actors={actors} icons={icons} />, this._element, () => {
                this.SetIconCss(icons);
            });
        });

    }


    public SetIconCss(icons: Array<Personal.Icon>) {
        icons.map((icon) => {
            ImageInfo.SetCss(icon.iid, icon.img);
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
        if (ImageUtil.IsImageDrag(event)) {
            this._dragFromOutSizeAction();
        }
    }

}

