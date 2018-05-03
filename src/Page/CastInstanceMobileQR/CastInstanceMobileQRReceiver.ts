
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import CastStatusSender from "../../Base/Container/CastStatusSender";
import TerminalInfoSender from "../../Contents/Sender/TerminalInfoSender";
import ConnCountSender from "../../Contents/Sender/ConnCountSender";
import MapLocationSender from "../../Contents/Sender/MapLocationSender";
import PictureSender from "../../Contents/Sender/PictureSender";


export class CastInstanceMobileQRReceiver extends AbstractServiceReceiver<CastInstanceMobileQRController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  HomeVistorから送信されたメッセージをそのまま、モバイル側に送信
        if (sender.type === GetCastSettingSedner.ID) { this.Controller.SwPeer.SendAll(sender); }

        //  
        if (sender.type === RoomSender.ID) {
            let rs = sender as RoomSender;
            this.Controller.SwPeer.SendAll(sender);
            this.Controller.View.SetRoom(rs.room);
        }

        //  配信ステータスはオーナー側にも送信
        if (sender.type === CastStatusSender.ID) {
            this.Controller.CastStatus = sender as CastStatusSender;
            this.Controller.SwPeer.SendToOwner(this.Controller.CastStatus);
            this.Controller.View.SetCastStauts(this.Controller.CastStatus);
        }

        if (sender.type === TerminalInfoSender.ID) {
            let info = sender as TerminalInfoSender;
            this.Controller.View.SetTerminalInfo(info);
        }

        if (sender.type === ConnCountSender.ID) {
            let cc = sender as ConnCountSender;
            this.Controller.View.SetPeerCount(cc.count);
        }

        if (sender.type === PictureSender.ID) {
            let pic = sender as PictureSender;
            this.Controller.View.SetPicture(pic);
        }

        if (sender.type === MapLocationSender.ID) {
            let mls = sender as MapLocationSender;
            this.Controller.View.SetMapLocation(mls);
        }

    }

}
