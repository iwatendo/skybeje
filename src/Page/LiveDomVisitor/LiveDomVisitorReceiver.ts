
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import LiveDomVisitorController from "./LiveDomVisitorController";
import { LiveDomVisitorView } from "./LiveDomVisitorView";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import IconSender from "../../Contents/Sender/IconSender";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import CursorClearSender from "../../Contents/Sender/CursorClearSender";
import LiveDomSender from "../../Contents/Sender/LiveDomSender";


export class LiveDomVisitorReceiver extends AbstractServiceReceiver<LiveDomVisitorController> {


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

        //  字幕表示
        if (sender.type === CastSubTitlesSender.ID) {
            this.Controller.View.Cursor.SetMessage(sender as CastSubTitlesSender);
        }

        //  LiveDom
        if (sender.type === LiveDomSender.ID) {
            this.Controller.View.SetLiveDom(sender as LiveDomSender);
        }
    }

}