
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import LiveDomInstanceController from "./LiveDomInstanceController";
import LiveDomInstanceView from "./LiveDomInstanceView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import IconSender from "../../Contents/Sender/IconSender";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import GetLiveDomSender from "../../Contents/Sender/GetLiveDomSender";


export class LiveDomInstanceReceiver extends AbstractServiceReceiver<LiveDomInstanceController> {


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
            let cst = sender as CastSubTitlesSender;
            this.Controller.SwPeer.SendAll(cst);
            this.Controller.View.Cursor.SetMessage(cst)
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.remoteId, (sender as IconSender).icon);
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  LiveDom情報送信
        if (sender.type === GetLiveDomSender.ID) {
            conn.send(this.Controller.View.LiveDom);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastSettingSedner.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

    }

}