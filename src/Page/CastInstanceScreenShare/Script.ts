import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";

if (StdUtil.IsExecute()) {

    let controller = new CastInstanceScreenShareController();
    controller.SwPeer = new SWPeer(controller, LinkUtil.GetPeerID(), () => {
        //  PeerIDをルーム名称とする
        let roomname = controller.SwPeer.PeerId;
        controller.SwRoom = new SWRoom(controller, controller, controller.SwPeer.Peer, roomname, SWRoomMode.SFU);
    });

}