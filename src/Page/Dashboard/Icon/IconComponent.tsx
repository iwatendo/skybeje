import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import LogUtil from "../../../Base/Util/LogUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order, IOrder } from "../../../Base/Container/Order";

import ImageDialogController from "../ImageDialogController";
import { IIConOwner } from "../Icon/IIConOwner";


/**
 * 
 */
export interface IconProp {
    owner: IIConOwner;
    icon: Personal.Icon;
}


/**
 * 
 */
export interface IconStat {
    icon: Personal.Icon;
}


/**
 * 
 */
export default class IconComponent extends React.Component<IconProp, IconStat>{


    /**
     * 
     */
    constructor(props?: IconProp, context?: any) {
        super(props, context);

        this.state = {
            icon: this.props.icon
        };

    }


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
            return (
                <div className="sbj-icon-cell mdl-card mdl-shadow--4dp" onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                    <div className="sbj-icon mdl-card--expand" id={id}>
                    </div>
                </div>
            );
        }
    }


    /**
     * ダブルクリック時処理
     */
    private OnDoubleClick(event) {
        let prop = this.props;
        ImageDialogController.EditDelete(prop.icon.img, (img) => this.OnImageEdit(prop, img));
    }


    /**
     * 画像編集時イベント
     */
    public OnImageEdit(prop: IconProp, image: ImageInfo) {

        let icon = prop.icon;

        if (image === null) {
            prop.owner.DeleteIcon(icon);
        }
        else {
            icon.img = image;
            prop.owner.UpdateIcon(icon);
        }

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
            LogUtil.Warning(null, e);
        }
    }

}
