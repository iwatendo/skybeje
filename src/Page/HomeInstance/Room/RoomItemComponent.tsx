import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ActorPeer from "../../../Base/Container/ActorPeer";
import RoomMemberComponent from "./RoomMemberComponent";
import { RoomView } from "./RoomView";


/**
 *  * グループ一覧プロパティ
 */
interface RoomItemProp {
    owner: RoomView;
    room: Home.Room;
    actpeers: Array<ActorPeer>;
}


/**
 * グループ一覧ステータス
 */
interface RoomItemStat {
    actpeers: Array<ActorPeer>;
}


/**
 *  グループメンバーコンポーネント
 */
export class RoomItemComponent extends React.Component<RoomItemProp, RoomItemStat>{


    /**
     * 
     * @param props
     * @param context
     */
    constructor(props?: RoomItemProp, context?: any) {
        super(props, context);

        this.state = {
            actpeers: this.props.actpeers,
        };
    }


    /**
     * グループリストの描画
     */
    public render() {

        let actorNodes = this.props.actpeers.map((pa) => {
            let key = pa.actor.aid + pa.actor.name;
            return (<RoomMemberComponent key={key} owner={this.props.owner} room={this.props.room} actorPeer={pa} />);
        });

        return (
            <div id={this.props.room.hid} className='group-panel mdl-cell mdl-cell--4-col mdl-cell--6-col-tablet mdl-cell--6-col-phone mdl-card mdl-shadow--3dp' onDrop={this.onDropMember.bind(this)}>
                <div className="sbj-home-instance-room-title">{this.props.room.name}</div>
                <div className="mdl-card__actions mdl-card--border">
                    {actorNodes}
                </div>
            </div >
        );
    }


    /**
     * ドロップ時イベント
     * @param ev
     */
    private onDropMember(ev: DragEvent) {

        //  自身のドラックアイテムの場合のみ処理を実行
        if (ev.dataTransfer.getData("text") === location.href) {
            this.props.owner.DragItem(this);
        }
    }

}
