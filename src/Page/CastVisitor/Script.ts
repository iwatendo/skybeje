import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastVisitorController from "./CastVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";

if (StdUtil.IsExecute()) {
    let ownerId = LinkUtil.GetPeerID();

    let controller = new CastVisitorController();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        controller.SwRoom = new SWRoom(controller, controller, controller.SwPeer.Peer, ownerId, SWRoomMode.SFU);
    });
}
