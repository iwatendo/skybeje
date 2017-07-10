import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import LogUtil from "../../../Base/Util/LogUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order, IOrder } from "../../../Base/Container/Order";

import ImageDialogController from "../../Dashboard/ImageDialogController";
import IconListComponent from "./IconListComponent";


/**
 * 
 */
export interface IconListItemProp {
    owner: IconListComponent;
    icon: Personal.Icon;
    isSelect: boolean;
}


/**
 * 
 */
export default class IconListItemComponent extends React.Component<IconListItemProp, any>{


    /**
     * 
     */
    public render() {

        let icon = this.props.icon;
        let id = icon.iid;

        if (icon === null) {
            return (<div></div>);
        }
        else {

            let iconCellClass = "sbj-icon-cell " + (this.props.isSelect ? "mdl-card mdl-shadow--8dp" : "");
            let iconClass = (this.props.isSelect ? "sbj-icon-select" : "sbj-icon") + " mdl-card--expand";

            return (
                <div className={iconCellClass} onClick={this.onClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                    <div className={iconClass} id={id}>
                    </div>
                </div>
            );
        }
    }


    /**
     * アイコン選択時イベント
     * @param evnet 
     */
    private onClick(evnet) {
        if (!this.props.isSelect) {
            this.props.owner.Select(this.props.icon);
        }
    }


    /**
     * ダブルクリック時処理
     */
    private OnDoubleClick(event) {
        //  プロフィール編集画面を閉じる
        this.props.owner.props.controller.CloseNotify();
    }


    /**
     * アイコンのドラッグ開始時処理
     */
    private OnDragStart(ev: DragEvent) {
        let json = JSON.stringify(this.props.icon);
        ev.dataTransfer.setData("text", json);
    }


    /**
     * ドロップ時イベント
     */
    private OnDrop(ev: DragEvent) {
        let text = ev.dataTransfer.getData("text");

        try {

            let dragIcon: Personal.Icon = JSON.parse(text);     //  移動元
            let dropIcon = this.props.icon;                     //  移動先

            //  同一プロフィール / アクターからのドロップのみ受付ける
            if (dragIcon && dragIcon.iid) {
                let preList = this.props.owner.GetIconList();
                let newList = Order.Swap(preList, dragIcon, dropIcon);
                this.props.owner.ChangeIconOrder(newList);
            }

        } catch (e) {
            LogUtil.Warning(e);
        }
    }

}
