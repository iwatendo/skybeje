
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";

import CastInstanceController from "./CastInstanceController";
import { CastCursorSender, GetCastInfoSedner, CastSettingSedner } from "./CastInstanceContainer";
import CastInstanceView from "./CastInstanceView";


export class CastInstanceReceiver extends AbstractServiceReceiver<CastInstanceController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === CastCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as CastCursorSender;
                this.Controller.SetCursorCache(cursor);
                WebRTCService.ChildSendAll(sender);
            }
        }

        //  キャスト情報の送信
        if (sender.type === GetCastInfoSedner.ID) {
            WebRTCService.ChildSend(conn, this.Controller.CastSetting);
        }

    }

}