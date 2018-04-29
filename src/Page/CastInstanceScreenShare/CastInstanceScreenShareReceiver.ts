
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import CastInstanceScreenShareView from "./CastInstanceScreenShareView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";


export class CastInstanceScreenShareReceiver extends AbstractServiceReceiver<CastInstanceScreenShareController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            if (this.Controller.CastSetting.useCastProp) {
                let cursor = sender as IconCursorSender;
                this.Controller.CursorCache.Set(cursor);
                this.Controller.SwPeer.SendAll(sender);
            }
        }

        //  チャット情報
        if (sender.type === ChatStatusSender.ID) {
            if (this.Controller.CastSetting.useCastProp) {
                let cst = sender as ChatStatusSender;
                this.Controller.SwPeer.SendAll(cst);
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