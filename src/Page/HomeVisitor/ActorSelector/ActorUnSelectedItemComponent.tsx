import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";

import ActorSelectorDialogComponent from "./ActorSelectorDialogComponent";


/**
 * 
 */
export interface ActorItemProp {
    owner: ActorSelectorDialogComponent;
    actor: Personal.Actor,
}


/**
 * 
 */
export default class ActorUnSelectedItemComponent extends React.Component<ActorItemProp, any>{


    /**
     * 
     */
    public render() {

        let actor = this.props.actor;
        let name = StdUtil.ToHtml(actor.name);
        let tag = StdUtil.ToHtml((actor.tag ? actor.tag : ""));

        let isSelect = false;
        let liclass = "mdl-list__item mdl-list__item--two-line" + (isSelect ? " mdl-card mdl-shadow--3dp" : "");

        return (
            <li className={liclass} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true}>
                <span className="mdl-list__item-primary-content">
                    <span>{name}</span>
                    <span className="mdl-list__item-sub-title">{tag}</span>
                </span>
                <div className="mdl-layout-spacer"></div>
                <button className="sbj-dialog-item-icon mdl-button mdl-button--icon" onClick={this.OnAppendClick.bind(this)}>
                    <i className="material-icons">person_add</i>
                </button>
            </li>
        );
    }


    /**
     * 
     */
    private OnAppendClick(event) {
        this.props.owner.AppendUseActor(this.props.actor);
    }


    /**
     * 
     */
    private OnDoubleClick(event) {
        this.props.owner.AppendUseActor(this.props.actor);
    }

}