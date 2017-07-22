import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import * as Home from "../../../Base/IndexedDB/Home";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import ActorPeer from "../../../Base/Container/ActorPeer";
import { Order } from "../../../Base/Container/Order";

import HomeInstanceController from "../HomeInstanceController";
import { RoomActorMemberSender } from "../HomeInstanceContainer";

import { RoomItemComponent } from "./RoomItemComponent";
import RoomMemberComponent from "./RoomMemberComponent";
import RoomComponent from "./RoomComponent";


/**
 * 
 */
export class RoomActors {
    room: Home.Room;
    actpeers: Array<ActorPeer>;
}



export class RoomView {

    private _controller: HomeInstanceController;
    private _element: HTMLElement;
    private _roomActors: Array<RoomActors>;


    public get Controller(): HomeInstanceController {
        return this._controller;
    }

    /**
     * コンストラクタ
     * @param controller 
     * @param element 
     * @param rooms 
     */
    public constructor(controller: HomeInstanceController, element: HTMLElement, rooms: Array<Home.Room>) {
        this._controller = controller;
        this._element = element;
        this._roomActors = new Array<RoomActors>();

        Order.Sort(rooms);

        rooms.map((room) => {
            let ra = new RoomActors();
            ra.room = room;
            ra.actpeers = new Array<ActorPeer>();
            this._roomActors.push(ra);
        });

        this.Create();
    }


    /**
     * 生成処理（描画処理）
     */
    public Create() {
        let key = StdUtil.UniqKey();
        ReactDOM.render(<RoomComponent key={key} view={this} roomActors={this._roomActors} />, this._element, () => {
            this._roomActors.forEach((ra) => {
                ImageInfo.SetCss(ra.room.hid, ra.room.background);
            });
        });
    }


    /**
     * ルーム情報の更新
     */
    public ChangeRoomInfo(rooms: Array<Home.Room>) {

        rooms.forEach((curRoom) => {

            let pres = this._roomActors.filter((ra) => ra.room.hid === curRoom.hid);
            if (pres.length > 0) {

                let pre = pres[0];
                let preRoom = pre.room;

                //  名前か画像が変更された場合、接続クライアントに通知する
                if (preRoom.name !== curRoom.name || !ImageInfo.Equals(preRoom.background, curRoom.background)) {
                    this.Controller.SendChnageRoom(curRoom);
                }

                pre.room = curRoom;
            }
            else {
                //  新しく追加された部屋の追加
                let ra = new RoomActors();
                ra.room = curRoom;
                ra.actpeers = new Array<ActorPeer>();
                this._roomActors.push(ra);
            }

        });

        this.Create();
    }


    /**
     * ルーム情報の削除
     * @param hid 
     */
    public DeleteRoom(room: Home.Room) {

        this._roomActors = this._roomActors.filter((ra) => ra.room.hid !== room.hid);
        this.Controller.Model.DeleteRoom(room, () => {
            this.Create();
        });
    }

    /**
     * ルームメンバーの変更
     * @param hid 
     * @param roomMember 
     */
    public ChangeRoomMember(hid: string, roomMember: Array<ActorPeer>) {
        let ras = this._roomActors.filter(n => n.room.hid === hid);
        if (ras.length > 0) {
            ras[0].actpeers = roomMember;
            this.Create();
        }
    }


    private _dragitem: RoomMemberComponent;


    /**
     * 
     * @param item 
     */
    public SetDragItem(item: RoomMemberComponent) {
        this._dragitem = item;
    }


    /**
     * 
     * @param roomitem 
     */
    public DragItem(roomitem: RoomItemComponent) {

        if (!this._dragitem) return;

        let peerid = this._dragitem.props.actorPeer.peerid;
        let aid = this._dragitem.props.actorPeer.actor.aid;
        let preHid = this._dragitem.props.room.hid;
        let newHid = roomitem.props.room.hid;

        if (preHid !== newHid) {

            //  変更通知
            this.Controller.Manager.Room.MoveRoom(peerid, aid, newHid, preHid);

            //  表示
            this.ChangeRoomMember(preHid, this.Controller.Manager.Room.GetRoomInActors(preHid));
            this.ChangeRoomMember(newHid, this.Controller.Manager.Room.GetRoomInActors(newHid));
        }

    }

}
