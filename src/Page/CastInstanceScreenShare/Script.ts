import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";

if (StdUtil.IsSupoortPlatform()) {

    let controller = new CastInstanceScreenShareController();
    controller.SwPeer = new SWPeer(controller, LinkUtil.GetPeerID(), () => {
    });

}