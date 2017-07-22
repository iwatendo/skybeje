﻿
import AbstractServiceController from "../../Base/Common/AbstractServiceController";

import * as Home from "../../Base/IndexedDB/Home";

import { Order } from "../../Base/Container/Order";
import RoomModel from "./RoomModel";
import RoomView from "./RoomView";


export default class RoomController extends AbstractServiceController<RoomView, RoomModel> {

    public Room: Home.Room;

    /**
     *
     */
    constructor(hid: string) {

        super();

        let self = this;
        let model = self.Model;

        self.Model = new RoomModel(self, () => {
            self.Model.GetRooms((rooms) => {

                let room = rooms.filter(n => n.hid === hid)[0];

                if (!room) {
                    //  新規ルーム作成
                    room = new Home.Room();
                    room.hid = hid;
                    room.name = "";
                    room.order = Order.New(rooms);
                }

                self.Room = room;
                self.View = new RoomView(self, () => { });
            });
        });

    };


    /**
     * 部屋情報の変更通知
     */
    public NotifyRoomChange(aid: string) {

        let element = window.parent.document.getElementById('sbj-dashborad-change-room') as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }


    /**
     * クローズ通知
     * ※親ドキュメント側から閉じる
     */
    public CloseNotify() {
        let element = window.parent.document.getElementById('sbj-room-frame-close') as HTMLInputElement;

        if (element) {
            element.click();
        }
    }

};