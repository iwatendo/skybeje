
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";
import IconCursorSender from "../../Base/Container/IconCursorSender";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import GadgetInstanceController from "./GadgetInstanceController";
import { GetGadgetCastSettingSedner, GadgetCastSettingSender, GetYouTubeStatusSender, YouTubeStatusSender } from "./GadgetInstanceContainer";
import GadgetInstanceView from "./GadgetInstanceView";
import { GuideSender, GetGuideSender } from "../HomeVisitor/HomeVisitorContainer";


export class GadgetInstanceReceiver extends AbstractServiceReceiver<GadgetInstanceController> {

    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  カーソル表示
        if (sender.type === IconCursorSender.ID) {
            if (this.Controller.CastSetting.dispUserCursor) {
                let cursor = sender as IconCursorSender;
                this.Controller.CursorCache.Set(cursor);
                WebRTCService.SendAll(sender);
            }
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoom(this.Controller.CastRoom.room);
        }

        if (sender.type === GuideSender.ID) {
            let guide = (sender as GuideSender).guide;
            this.Controller.Guide = guide
            this.Controller.View.SetGuide(guide, true);
        }

        //  キャスト情報の送信
        if (sender.type === GetGadgetCastSettingSedner.ID) {
            this.Controller.CastSetting.status = this.Controller.View.CreateYouTubeStatus();
            WebRTCService.SendTo(conn, this.Controller.CastSetting);
        }

        //  YouTubeの再生状況の送信
        if (sender.type == GetYouTubeStatusSender.ID) {
            WebRTCService.SendTo(conn, this.Controller.View.CreateYouTubeStatus());
        }

        //  YouTubeの再生状況の送信
        if (sender.type == YouTubeStatusSender.ID) {
            this.Controller.View.SetYouTubeStatus(conn, sender as YouTubeStatusSender)
        }

    }

}