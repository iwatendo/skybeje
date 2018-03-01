
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import CastInstanceMobileController from "./CastInstanceMobileController";
import CastInstanceMobileView from "./CastInstanceMobileView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";


export class CastInstanceMobileReceiver extends AbstractServiceReceiver<CastInstanceMobileController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as IconCursorSender;
                this.Controller.CursorCache.Set(cursor);
                this.Controller.SwPeer.SendAll(sender);
            }
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            //  this.Controller.View.SetRoomName(this.Controller.CastRoom.room);
        }

        //
        if (sender.type === GetCastSettingSedner.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

        if (sender.type === CastSettingSender.ID) {
            let mcs = sender as CastSettingSender;
            this.Controller.SetCastSetting(mcs);
        }

    }

}