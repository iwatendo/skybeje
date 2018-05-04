
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceController from "./CastInstanceController";
import CastInstanceView from "./CastInstanceView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import IconSender from "../../Contents/Sender/IconSender";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";


export class CastInstanceReceiver extends AbstractServiceReceiver<CastInstanceController> {


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
                this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
            }
        }

        //  チャット情報
        if (sender.type === ChatStatusSender.ID) {
            if (this.Controller.CastSetting.useCastProp) {
                let cst = sender as ChatStatusSender;
                this.Controller.SwPeer.SendAll(cst);
                this.Controller.View.Cursor.SetMessage(cst)
            }
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.remoteId, (sender as IconSender).icon);
        }

        //  配信先のチャットルーム情報
        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoomName(this.Controller.CastRoom.room);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastSettingSedner.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

    }

}