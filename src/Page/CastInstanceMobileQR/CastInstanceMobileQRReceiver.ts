
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";


export class CastInstanceMobileQRReceiver extends AbstractServiceReceiver<CastInstanceMobileQRController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
        }

        if (sender.type === RoomSender.ID) {
        }

        //  キャスト情報の送信
        if (sender.type === GetCastSettingSedner.ID) {
        }

    }

}