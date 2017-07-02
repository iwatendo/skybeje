import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialog from "./ActorDialog";



/**
 * プロパティ
 */
export interface RoomMemberItemProp {
    controller: HomeVisitorController;
    actor: Personal.Actor;
}


export default class RoomMemberItemComponent extends React.Component<RoomMemberItemProp, any> {


    /**
     * 
     */
    public render() {

        let dispname = this.props.actor.name;

        return (
            <li className="mdl-menu__item" onClick={this.onClick.bind(this)}>{dispname}</li>
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
