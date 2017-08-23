
import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";
import LogUtil from "../../Base/Util/LogUtil";
import WebRTCService from "../../Base/Common/WebRTCService";
import IconCursorSender  from "../../Base/Container/IconCursorSender";
import GadgetVisitorController from "./GadgetVisitorController";
import { GadgetVisitorView } from "./GadgetVisitorView";
import * as HIContainer from "../HomeInstance/HomeInstanceContainer";
import * as HVContainer from "../HomeVisitor/HomeVisitorContainer";
import * as CIContainer from "../CastInstance/CastInstanceContainer";
import { GadgetCastSettingSender } from "../GadgetInstance/GadgetInstanceContainer";



export class GadgetVisitorReceiver extends AbstractServiceReceiver<GadgetVisitorController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender){

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            this.Controller.View.Cursor.SetCursor(sender as IconCursorSender);
        }

        //  キャスト情報の通知
        if (sender.type === GadgetCastSettingSender.ID) {
            this.Controller.View.SetGadgetSetting(sender as GadgetCastSettingSender);
        }

        //  アイコン取得
        if (sender.type === HVContainer.IconSender.ID) {
            this.Controller.View.Cursor.SetIcon(conn.peer, (sender as HVContainer.IconSender).icon);
        }
        
    }

}