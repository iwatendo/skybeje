
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import CastInstanceSender from "../../Base/Container/CastInstanceSender";


export class CastInstanceMobileQRReceiver extends AbstractServiceReceiver<CastInstanceMobileQRController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  HomeVistorから送信されたメッセージをそのまま、モバイル側に送信
        if (sender.type === RoomSender.ID) { this.Controller.SwPeer.SendAll(sender); }
        if (sender.type === GetCastSettingSedner.ID) { this.Controller.SwPeer.SendAll(sender); }

        //  配信ステータスはオーナー側にも送信
        if (sender.type === CastInstanceSender.ID) {
            this.Controller.SwPeer.SendToOwner(sender);
        }

    }

}
