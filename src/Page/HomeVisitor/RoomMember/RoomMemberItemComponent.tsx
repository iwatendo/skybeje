import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialog from "./ActorDialog";
import ActorInfo from "../../../Base/Container/ActorInfo";
import RoomActorItemComponent from "./RoomActorItemComponent";



/**
 * プロパティ
 */
export interface RoomMemberItemProp {
    controller: HomeVisitorController;
    ownerAid: string;
    ownerPeerId: string;
    actors: Array<ActorInfo>;
}


/**
 * プロパティ
 */
export interface RoomMemberItemStat {
    ownerProfile: ActorInfo;
}



export default class RoomMemberItemComponent extends React.Component<RoomMemberItemProp, RoomMemberItemStat> {


    /**
      * コンストラクタ
      * @param props
      * @param context
      */
    constructor(props?: RoomMemberItemProp, context?: any) {
        super(props, context);

        let prof = new ActorInfo("","",new Personal.Actor());
        prof.name = "(読込中)";

        this.state = {
            ownerProfile: prof,
        };

        let aid = this.props.ownerAid;
        let peerid = this.props.ownerPeerId;

        this.props.controller.ActorCache.GetActor(peerid, aid, (actor) => {
            if (actor) {
                this.setState({
                    ownerProfile: actor
                });
            }
        });
    }


    /**
     * 
     */
    public render() {

        let dispname = this.state.ownerProfile.name;

        let actorTable = this.props.actors.map((ai) => {
            if (!ai.isUser) {
                return (<RoomActorItemComponent key={ai.aid} controller={this.props.controller} actorInfo={ai} />);
            }
        });


        return (
            <div>
                <li className="sbj-home-visitor-room-member-item mdl-list__item" onClick={this.onClick.bind(this)}>
                    <span className="mdl-list__item-primary-content">
                        <i className="material-icons mdl-list__item-icon sbj-home-visitor-room-member-icon">account_box</i>
                        {dispname}
                    </span>
                </li>
                {actorTable}
            </div>
        );
    }


    /**
     * 選択時処理
     * @param e 
     */
    private onClick(e) {

        let dialog = new ActorDialog(this.props.controller);

        //  アクターダイアログの表示
        dialog.Show(DialogMode.View, this.state.ownerProfile, (result) => { });
    }

}
