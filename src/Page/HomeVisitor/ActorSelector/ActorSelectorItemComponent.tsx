import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { Order } from "../../../Base/Container/Order";
import StdUtil from "../../../Base/Util/StdUtil";

import ActorSelectorDialogComponent from "./ActorSelectorDialogComponent";


/**
 * 
 */
export interface ActorItemProp {
    owner: ActorSelectorDialogComponent;
    actor: Personal.Actor,
    isSelect: boolean,
}


/**
 * 
 */
export default class ActorSelectorItemComponent extends React.Component<ActorItemProp, any>{


    /**
     * 
     */
    public render() {

        let actor = this.props.actor;
        let name = StdUtil.ToHtml(actor.name);
        let tag = StdUtil.ToHtml((actor.tag ? actor.tag : ""));

        let liclass = "mdl-list__item mdl-list__item--two-line" +
            (this.props.isSelect ? " mdl-card mdl-shadow--3dp sbj-select-actor" : "");

        let removeicon = (<div></div>);

        if (!actor.isUserProfile) {
            removeicon = (
                <div>
                    <div className="mdl-layout-spacer"></div>
                    <button className="sbj-dialog-item-icon mdl-button mdl-button--icon" onClick={this.OnRemoveClick.bind(this)}>
                        <i className="material-icons">backspace</i>
                    </button>
                </div>
            );
        }

        return (
            <li className={liclass} onClick={this.OnClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true}>
                <span className="mdl-list__item-primary-content">
                    <span>{name}</span>
                    <span className="mdl-list__item-sub-title">{tag}</span>
                </span>
                {removeicon}
            </li>
        );
    }


    /**
     *  クリック時イベント
     */
    private OnClick(event) {
        this.props.owner.ChangeSelectActor(this.props.actor);
    }


    /**
     *  ダブルクリック時
     */
    private OnDoubleClick(event) {
        if (this.props.isSelect) {
            this.props.owner.OnSelectActor(this.props.actor.aid);
        }
    }


    /**
     *  リムーブボタン押下時
     */
    private OnRemoveClick(event) {
        this.props.owner.RemoveUseActor(this.props.actor);
    }

}