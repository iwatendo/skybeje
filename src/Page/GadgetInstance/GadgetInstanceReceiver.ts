
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import GadgetInstanceController from "./GadgetInstanceController";
import GadgetInstanceView from "./GadgetInstanceView";
import RoomSender from "../../Contents/Sender/RoomSender";
import GuideSender from "../../Contents/Sender/GuideSender";
import GetGadgetCastSettingSedner from "../../Contents/Sender/GetGadgetCastSettingSedner";
import GetYouTubeStatusSender from "../../Contents/Sender/GetYouTubeStatusSender";
import YouTubeStatusSender from "../../Contents/Sender/YouTubeStatusSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";


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
                this.Controller.SwPeer.SendAll(sender);
            }
        }

        if (sender.type === RoomSender.ID) {
            this.Controller.CastRoom = sender as RoomSender;
            this.Controller.View.SetRoomName(this.Controller.CastRoom.room);
        }

        if (sender.type === GuideSender.ID) {
            let guide = (sender as GuideSender).guide;
            this.Controller.Guide = guide
            this.Controller.View.SetGuide(guide, true);
        }

        //  キャスト情報の送信
        if (sender.type === GetGadgetCastSettingSedner.ID) {
            this.Controller.CastSetting.status = this.Controller.View.CreateYouTubeStatus();
            this.Controller.SwPeer.SendTo(conn, this.Controller.CastSetting);
        }

        //  YouTubeの再生状況の送信
        if (sender.type == GetYouTubeStatusSender.ID) {
            this.Controller.SwPeer.SendTo(conn, this.Controller.View.CreateYouTubeStatus());
        }

        //  YouTubeの再生状況の送信
        if (sender.type == YouTubeStatusSender.ID) {
            this.Controller.View.SetYouTubeStatus(conn, sender as YouTubeStatusSender)
        }

    }

}