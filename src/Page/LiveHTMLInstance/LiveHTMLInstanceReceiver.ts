
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import LiveHTMLInstanceController from "./LiveHTMLInstanceController";
import LiveHTMLInstanceView from "./LiveHTMLInstanceView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import IconSender from "../../Contents/Sender/IconSender";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import GetLiveHTMLSender from "../../Contents/Sender/GetLiveHTMLSender";
import LiveHTMLMessageSender from "../../Contents/Sender/LiveHTMLMessageSender";


export class LiveHTMLInstanceReceiver extends AbstractServiceReceiver<LiveHTMLInstanceController> {


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

        //  字幕表示
        if (sender.type === CastSubTitlesSender.ID) {
            if (this.Controller.CastSetting.useCastProp) {
                let cst = sender as CastSubTitlesSender;
                this.Controller.SwPeer.SendAll(cst);
                this.Controller.View.Cursor.SetMessage(cst)
            }
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.remoteId, (sender as IconSender).icon);
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  LiveHTML情報送信
        if (sender.type === GetLiveHTMLSender.ID) {
            conn.send(this.Controller.View.LiveHTML);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastSettingSedner.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

        //  LiveHTMLからの入力情報
        if (sender.type === LiveHTMLMessageSender.ID) {
            this.Controller.SwPeer.SendToOwner(sender);
        }

    }

}