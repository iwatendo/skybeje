import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import LogUtil from "../../../Base/Util/LogUtil";
import { Order } from "../../../Base/Container/Order";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import ImageDialogController from "../ImageDialogController";
import DashboardController from "../DashboardController";
import HomeEditDialogController from "./HomeEditDialog/HomeEditDialogController";
import HomeView from "./HomeView";
import HomeComponent from "./HomeComponent";


/**
 * 
 */
export interface HomeItemProp {
    owner: HomeComponent;
    room: Home.Room,
    isSelect: boolean,
}


/**
 * 
 */
export interface HomeItemStat {
    room: Home.Room,
}


/**
 * 
 */
export default class HomeItemComponent extends React.Component<HomeItemProp, HomeItemStat>{

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: HomeItemProp, context?: any) {
        super(props, context);

        this.state = {
            room: this.props.room
        };
    }


    /**
     * 
     */
    public render() {

        let liclass = "mdl-list__item mdl-list__item--two-line" +
            (this.props.isSelect ? " mdl-card mdl-shadow--3dp" : "");

        let vert = (<div></div>);

        if (this.props.isSelect) {
            vert = (
                <div>
                    <div className="mdl-layout-spacer"></div>
                    <button className="sbj-dialog-item-icon mdl-button mdl-button--icon" onClick={this.OnClickShowMenu.bind(this)}>
                        <i className="material-icons">more_vert</i>
                    </button>
                </div>
            );
        }

        let avatarstyle = {
            color: 'var(--sbj-color-default-text)',
            borderRadius: "0%",
            backgroundColor: "initial",
        };

        return (
            <li className={liclass} onClick={this.OnClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                <span className="mdl-list__item-primary-content">
                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>note</i>
                    <span>{this.state.room.name}</span>
                    <span className="mdl-list__item-sub-title">{this.state.room.tag}</span>
                </span>
                {vert}
            </li>
        );
    }


    /**
     * 
     */
    private OnClick(event) {
        this.props.owner.SelectRoom(this.props.room);
    }


    /**
     * 
     */
    private OnDoubleClick(event) {
        if (this.props.isSelect) {
            this.OnClickShowMenu(null);
        }
    }


    /**
     * 
     */
    private OnClickShowMenu(ev) {

        let preHome = this.state.room;
        let dialog = new HomeEditDialogController(null);
        dialog.Title = this.props.owner.props.controller.GetEditModeDialogTitle();

        //  デフォルトルームの場合は削除不可
        let mode = (preHome.isDefault ? DialogMode.Edit : DialogMode.EditDelete);

        dialog.Show(mode, this.state.room, (curHome) => {

            if (curHome === null) {
                this.props.owner.DeleteRoom(preHome);
            }
            else {
                this.props.owner.UpdateRoom(curHome);
                this.setState({
                    room: curHome,
                });
            }

        });
    }


    /**
     * アクターのドラッグ開始時
     */
    private OnDragStart(ev: DragEvent) {
        let json = JSON.stringify(this.props.room);
        ev.dataTransfer.setData("text", json);
    }

    /**
     * ドロップ時イベント
     */
    private OnDrop(ev: DragEvent) {
        let text = ev.dataTransfer.getData("text");

        try {
            let dragRoom: Home.Room = JSON.parse(text);  //  移動元
            let dropRoom = this.props.room;              //  移動先

            if (dragRoom && dragRoom.hid) {
                let preList = this.props.owner.state.rooms;
                let newList = Order.Swap(preList, dragRoom, dropRoom);

                this.props.owner.ChangeRoomOrder(newList);
            }

        } catch (e) {
            LogUtil.Warning(e);
        }
    }

}