import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ActorPeer from "../../../Base/Container/ActorPeer";
import RoomMemberComponent from "./RoomMemberComponent";
import { RoomView } from "./RoomView";
import RoomComponent from "./RoomComponent";


/**
 *  * グループ一覧プロパティ
 */
interface RoomItemProp {
    view: RoomView;
    owner: RoomComponent;
    room: Home.Room;
    actpeers: Array<ActorPeer>;
}


/**
 *  グループメンバーコンポーネント
 */
export class RoomItemComponent extends React.Component<RoomItemProp, any>{


    /**
     * グループリストの描画
     */
    public render() {

        let actorNodes = this.props.actpeers.map((pa) => {
            let key = pa.actor.aid + pa.actor.name;
            return (<RoomMemberComponent key={key} view={this.props.view} room={this.props.room} actorPeer={pa} />);
        });

        let canDelete = !this.props.room.isDefault && (this.props.actpeers.length === 0);

        return (
            <div id={this.props.room.hid} className='group-panel mdl-cell mdl-cell--4-col mdl-cell--6-col-tablet mdl-cell--6-col-phone mdl-card mdl-shadow--3dp' onDrop={this.onDropMember.bind(this)}>
                <div className="sbj-home-instance-room-header">
                    <span className="sbj-home-instance-room-title">{this.props.room.name}</span>
                    <button className="sbj-home-instance-room-edit-button mdl-button mdl-button--colored" onClick={this.OnEditClick.bind(this)}>
                        <i className='material-icons'>edit</i>
                        &nbsp;編集&nbsp;
                    </button>
                    <button className="sbj-home-instance-room-edit-button mdl-button mdl-button--accent" onClick={this.OnDeleteClick.bind(this)} hidden={!canDelete}>
                        <i className='material-icons'>delete</i>
                        &nbsp;削除&nbsp;
                    </button>
                </div>
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
            this.props.view.DragItem(this);
        }
    }

    /**
     * 編集
     * @param event 
     */
    private OnEditClick(event) {
        let room = this.props.room;
        this.props.view.Controller.View.DoShowRoomEditDialog(room.hid);
    }


    /**
     * 編集
     * @param event 
     */
    private OnDeleteClick(event) {
        let room = this.props.room;
        this.DeleteRoom(room.hid);
    }


    /**
     * ルームの削除
     * @param aid 
     */
    public DeleteRoom(hid: string) {
        this.props.view.Controller.Model.GetRoom(hid, (room) => {
            if (room.isDefault) {
                return;
            }
            if (window.confirm('削除したルームは元に戻せません。\n削除してよろしいですか？')) {
                this.props.view.DeleteRoom(room);
            }
        });
    }

}
