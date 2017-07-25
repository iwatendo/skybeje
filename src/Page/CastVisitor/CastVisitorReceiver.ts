
import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import WebRTCService from "../../Base/Common/WebRTCService";
import CastVisitorController from "./CastVisitorController";
import { CastVisitorView } from "./CastVisitorView";
import * as HIContainer from "../HomeInstance/HomeInstanceContainer";
import * as HVContainer from "../HomeVisitor/HomeVisitorContainer";
import * as CIContainer from "../CastInstance/CastInstanceContainer";


export class CastVisitorReceiver extends AbstractServiceReceiver<CastVisitorController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender){

        //  カーソル表示
        if (sender.type === CIContainer.CastCursorSender.ID) {
            this.Controller.View.Cursor.SetCursor(sender as CIContainer.CastCursorSender);
        }

        //  キャスト情報の通知
        if (sender.type === CIContainer.CastSettingSender.ID) {
            this.Controller.View.SetCastSetting(sender as CIContainer.CastSettingSender);
        }

        //  アイコン取得
        if (sender.type === HVContainer.IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.peer, (sender as HVContainer.IconSender).icon);
        }

        //  字幕表示
        if(sender.type === CIContainer.CastSpeechRecognitionSender.ID){
            this.Controller.View.SubTitles.SetMessage(sender as CIContainer.CastSpeechRecognitionSender);
        }
    }

}