
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";
import IconCursorSender from "../../Base/Container/IconCursorSender";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import CastInstanceController from "./CastInstanceController";
import { GetCastInfoSedner, CastSettingSender } from "./CastInstanceContainer";
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
                WebRTCService.SendAll(sender);
            }
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastInfoSedner.ID) {
            WebRTCService.SendTo(conn, this.Controller.CastSetting);
        }

    }

}