
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";

import GadgetInstanceController from "./GadgetInstanceController";
import { CastCursorSender, GetCastInfoSedner, CastSettingSender, CastRoomSender } from "./GadgetInstanceContainer";
import GadgetInstanceView from "./GadgetInstanceView";


export class GadgetInstanceReceiver extends AbstractServiceReceiver<GadgetInstanceController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === CastCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as CastCursorSender;
                this.Controller.SetCursorCache(cursor);
                WebRTCService.SendAll(sender);
            }
        }

        if (sender.type === CastRoomSender.ID) {
            this.Controller.CastRoom = sender as CastRoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        //  キャスト情報の送信
        if (sender.type === GetCastInfoSedner.ID) {
            WebRTCService.SendTo(conn, this.Controller.CastSetting);
        }

    }

}