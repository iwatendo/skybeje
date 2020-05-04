
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import LiveHTMLInstanceController from "./LiveHTMLInstanceController";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import IconSender from "../../Contents/Sender/IconSender";
import GetLiveHTMLSender from "../../Contents/Sender/GetLiveHTMLSender";
import LiveHTMLMessageSender from "../../Contents/Sender/LiveHTMLMessageSender";
import VoiceChatMemberSender from "../../Contents/Sender/VoiceChatMemberSender";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";


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
                if (this.Controller.View.Cursor) {
                    this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
                }
            }
        }

        //  チャット情報
        if (sender.type === ChatStatusSender.ID) {
            if (this.Controller.CastSetting.useCastProp) {
                let cst = sender as ChatStatusSender;
                this.Controller.SwPeer.SendAll(cst);
                this.Controller.View.SetMessage(cst);
            }
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.remoteId, (sender as IconSender).icon);
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoomName(this.Controller.CastRoom.room);
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

        //  ボイスチャットのメンバー通知
        if (sender.type === VoiceChatMemberSender.ID) {
            let vcm = (sender as VoiceChatMemberSender);
            let isAppend = this.Controller.VoiceChat.SetMember(vcm);
            //  if (isAppend) { this.DummyJoin(vcm.isSFU); }
        }

    }

}