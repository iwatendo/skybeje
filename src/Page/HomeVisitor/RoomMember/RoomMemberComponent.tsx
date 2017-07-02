import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";
import { RoomActorMemberSender } from "../../HomeInstance/HomeInstanceContainer";
import RoomMemberItemComponent from "./RoomMemberItemComponent";


/**
 * プロパティ
 */
export interface RoomMemberProp {
    controller: HomeVisitorController;
    roomActorMember: RoomActorMemberSender;
}


export default class RoomMemberComponent extends React.Component<RoomMemberProp, any> {


    /**
     * 
     */
    public render() {

        let actorTable;

        let ram = this.props.roomActorMember;
        if (ram) {
            actorTable = ram.members.map((rm) => {
                return (<RoomMemberItemComponent key={rm.actor.aid} controller={this.props.controller} actor={rm.actor} />);
            });
        }

        return (
            <div>
                {actorTable}
            </div>
        );
    }

}
