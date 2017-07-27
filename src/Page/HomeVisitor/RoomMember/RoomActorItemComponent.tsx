import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialog from "./ActorDialog";
import ActorPeer from "../../../Base/Container/ActorPeer";



/**
 * プロパティ
 */
export interface RoomActorItemProp {
    controller: HomeVisitorController;
    actor: Personal.Actor;
}


export default class RoomActorItemComponent extends React.Component<RoomActorItemProp, any> {


    /**
     * 
     */
    public render() {

        return (
            <li className="sbj-home-visitor-room-member-item mdl-list__item" onClick={this.onClick.bind(this)}>
                <span className="mdl-list__item-primary-content">
                    <i className="sbj-home-visitor-room-actor-icon material-icons mdl-list__item-icon">label_outline</i>
                    {this.props.actor.name}
                </span>
            </li>
        );
    }


    /**
     * 選択時処理
     * @param e 
     */
    private onClick(e) {

        let dialog = new ActorDialog(this.props.controller);

        //  アクターダイアログの表示
        dialog.Show(DialogMode.View, this.props.actor, (result) => { });
    }

}
