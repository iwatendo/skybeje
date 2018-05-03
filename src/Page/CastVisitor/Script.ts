import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastVisitorController from "./CastVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";

if (StdUtil.IsSupoortPlatform(true)) {

    let controller = new CastVisitorController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => { });
}
