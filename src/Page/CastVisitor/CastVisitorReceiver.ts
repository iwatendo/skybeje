
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import IconCursorSender  from "../../Base/Container/IconCursorSender";
import CastVisitorController from "./CastVisitorController";
import { CastVisitorView } from "./CastVisitorView";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import IconSender from "../../Contents/Sender/IconSender";
import CastSpeechRecognitionSender from "../../Contents/Sender/CastSpeechRecognitionSender";


export class CastVisitorReceiver extends AbstractServiceReceiver<CastVisitorController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender){

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
        }

        //  キャスト情報の通知
        if (sender.type === CastSettingSender.ID) {
            this.Controller.View.SetCastSetting(sender as CastSettingSender);
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.peer, (sender as IconSender).icon);
        }

        //  字幕表示
        if(sender.type === CastSpeechRecognitionSender.ID){
            this.Controller.View.SubTitles.SetMessage(sender as CastSpeechRecognitionSender);
        }
    }

}