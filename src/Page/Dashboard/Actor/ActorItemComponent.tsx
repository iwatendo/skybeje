import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Base/IndexedDB/Personal";
import ImageDialogController from "../ImageDialogController";
import StdUtil from "../../../Base/Util/StdUtil";
import DashboardController from "../DashboardController";
import { Order } from "../../../Base/Container/Order";
import LogUtil from "../../../Base/Util/LogUtil";
import ActorEditDialogController from "./ActorEditDialog/ActorEditDialogController";
import ActorView from "./ActorView";
import ActorComponent from "./ActorComponent";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";


/**
 * 
 */
export interface ActorItemProp {
    owner: ActorComponent;
    actor: Personal.Actor,
    isSelect: boolean,
}


/**
 * 
 */
export interface ActorItemStat {
    actor: Personal.Actor,
}


/**
 * 
 */
export default class ActorItemComponent extends React.Component<ActorItemProp, ActorItemStat>{

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ActorItemProp, context?: any) {
        super(props, context);

        this.state = {
            actor: this.props.actor,
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
                    <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" onClick={this.OnClickShowMenu.bind(this)}>
                        <i className="sbj-dialog-item-icon material-icons">more_vert</i>
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
                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>account_box</i>
                    <span>{this.state.actor.name}</span>
                    <span className="mdl-list__item-sub-title">{this.state.actor.tag}</span>
                </span>
                {vert}
            </li>
        );
    }


    /**
     * 
     */
    private OnClick(event) {
        this.props.owner.SelectActor(this.props.actor);
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

        let preActor = this.state.actor;
        let dialog = new ActorEditDialogController(null);
        dialog.Title = "アクターの変更";

        dialog.Show(DialogMode.EditDelete, this.state.actor, (curActor) => {

            if (curActor === null) {
                this.props.owner.DeleteActor(preActor);
            }
            else {
                this.props.owner.UpdateActor(curActor);

                this.setState({
                    actor: curActor,
                });

            }

        });
    }


    /**
     * アクターのドラッグ開始時
     */
    private OnDragStart(ev: DragEvent) {
        let json = JSON.stringify(this.props.actor);
        ev.dataTransfer.setData("text", json);
    }

    /**
     * ドロップ時イベント
     */
    private OnDrop(ev: DragEvent) {
        let text = ev.dataTransfer.getData("text");

        try {

            let dragActor: Personal.Actor = JSON.parse(text);     //  移動元
            let dropActor = this.props.actor;                     //  移動先

            if (dragActor && dragActor.aid) {
                let preList = this.props.owner.state.actors;
                let newList = Order.Swap(preList, dragActor, dropActor);

                this.props.owner.ChangeActorOrder(newList);
            }

        } catch (e) {
            LogUtil.Warning(e);
        }
    }

}