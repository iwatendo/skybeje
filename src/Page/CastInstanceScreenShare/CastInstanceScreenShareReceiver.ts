
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";
import IconCursorSender  from "../../Base/Container/IconCursorSender";

import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import { GetCastInfoSedner, CastSettingSender, CastRoomSender } from "../CastInstance/CastInstanceContainer";
import CastInstanceScreenShareView from "./CastInstanceScreenShareView";


export class CastInstanceScreenShareReceiver extends AbstractServiceReceiver<CastInstanceScreenShareController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as IconCursorSender;
                this.Controller.SetCursorCache(cursor);
                WebRTCService.SendAll(sender);
            }
        }

        if (sender.type === CastRoomSender.ID) {
            this.Controller.CastRoom = sender as CastRoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastInfoSedner.ID) {
            WebRTCService.SendTo(conn, this.Controller.CastSetting);
        }

    }

}