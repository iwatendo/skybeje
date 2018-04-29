
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import LiveHTMLVisitorController from "./LiveHTMLVisitorController";
import { LiveHTMLVisitorView } from "./LiveHTMLVisitorView";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import IconSender from "../../Contents/Sender/IconSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import CursorClearSender from "../../Contents/Sender/CursorClearSender";
import LiveHTMLSender from "../../Contents/Sender/LiveHTMLSender";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";


export class LiveHTMLVisitorReceiver extends AbstractServiceReceiver<LiveHTMLVisitorController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
        }

        //  カーソルクリア
        if (sender.type === CursorClearSender.ID) {
            this.Controller.View.Cursor.Clear();
        }

        //  キャスト情報の通知
        if (sender.type === CastSettingSender.ID) {
            this.Controller.View.SetCastSetting(sender as CastSettingSender);
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.remoteId, (sender as IconSender).icon);
        }

        //  チャット情報
        if (sender.type === ChatStatusSender.ID) {
            this.Controller.View.Cursor.SetMessage(sender as ChatStatusSender);     //  字幕表示
        }

        //  LiveHTML
        if (sender.type === LiveHTMLSender.ID) {
            this.Controller.View.SetLiveHTML(sender as LiveHTMLSender);
        }
    }

}