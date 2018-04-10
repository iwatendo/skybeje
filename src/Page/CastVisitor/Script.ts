import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastVisitorController from "./CastVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";

if (StdUtil.IsSupoortPlatform(true)) {

    let controller = new CastVisitorController();

    let ownerId = LinkUtil.GetPeerID();
    let roomMode = (controller.UseSFU() ? SWRoomMode.SFU : SWRoomMode.Mesh);

    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        controller.SwRoom = new SWRoom(controller, ownerId, roomMode);
    });
}
