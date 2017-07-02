import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { INaviContainer, DragAction } from "../INaviContainer";
import NotImplementComponent from "./NotImplementComponent";


/**
 * 
 */
export default class NotImplementView implements INaviContainer {

    private _element: HTMLElement;
    private _dragFromOutSizeAction: DragAction;


    /**
     * 
     */
    public constructor(element: HTMLElement) {
        this._element = element;
        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {

        this.Initialize();
        
    }


    /**
     * 
     */
    private Initialize() {

        ReactDOM.render(<NotImplementComponent controller={this} />, this._element, () => {
        });
    }




    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
    }


    /**
     *  外部からのドラッグイベント時に呼ばれる処理
     */
    public OnDragFromOutside(event: DragEvent) {
    }

}