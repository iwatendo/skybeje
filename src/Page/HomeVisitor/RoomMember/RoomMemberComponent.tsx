import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import HomeVisitorController from "../HomeVisitorController";
import { RoomActorMemberSender } from "../../HomeInstance/HomeInstanceContainer";
import RoomMemberItemComponent from "./RoomMemberItemComponent";
import ActorPeer from "../../../Base/Container/ActorPeer";


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

        let actorMap = new Map<string, Array<ActorPeer>>();

        this.props.roomActorMember.members.map((ap) => {

            let actor = ap.actor;
            let ownerAid = (actor.isUserProfile ? actor.aid : actor.ownerAid);

            if (!actorMap.has(ownerAid)) {
                actorMap.set(ownerAid, new Array<ActorPeer>());
            }
            actorMap.get(ownerAid).push(ap);

        });

        let actorTable;

        if (actorMap) {

            let list = new Array<Array<ActorPeer>>();
            actorMap.forEach((value, key) => { list.push(value) });

            actorTable = list.map((actors) => {
                let first = actors[0];
                let ownerPeerId = first.peerid;
                let ownerAid = (first.actor.isUserProfile ? first.actor.aid : first.actor.ownerAid);
                return (<RoomMemberItemComponent key={ownerAid} controller={this.props.controller} ownerAid={ownerAid} ownerPeerId={ownerPeerId} actors={actors} />);
            });
        }

        return (
            <div>
                {actorTable}
            </div>
        );
    }

}
