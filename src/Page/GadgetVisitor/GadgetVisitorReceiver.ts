
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import GadgetVisitorController from "./GadgetVisitorController";
import { GadgetVisitorView } from "./GadgetVisitorView";
import IconSender from "../../Contents/Sender/IconSender";
import GadgetCastSettingSender from "../../Contents/Sender/GadgetCastSettingSender";
import YouTubeStatusSender from "../../Contents/Sender/YouTubeStatusSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";


export class GadgetVisitorReceiver extends AbstractServiceReceiver<GadgetVisitorController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            //  this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.peer, (sender as IconSender).icon);
        }

        //  キャスト情報の通知
        if (sender.type === GadgetCastSettingSender.ID) {
            this.Controller.View.SetGadgetSetting(sender as GadgetCastSettingSender);
        }

        //  YouTubeの再生状況の送信
        if (sender.type == YouTubeStatusSender.ID) {
            this.Controller.View.SetYouTubeStatus(sender as YouTubeStatusSender);
        }

    }

}