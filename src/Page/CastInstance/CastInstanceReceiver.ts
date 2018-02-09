
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import IconCursorSender from "../../Base/Container/IconCursorSender";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import CastInstanceController from "./CastInstanceController";
import { GetCastSettingSedner, CastSettingSender } from "./CastInstanceContainer";
import CastInstanceView from "./CastInstanceView";


export class CastInstanceReceiver extends AbstractServiceReceiver<CastInstanceController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as IconCursorSender;
                this.Controller.CursorCache.Set(cursor);
                this.Controller.SwPeer.SendAll(sender);
            }
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastSettingSedner.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

    }

}