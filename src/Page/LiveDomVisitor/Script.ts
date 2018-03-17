import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveDomVisitorController from "./LiveDomVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";

if (StdUtil.IsSupoortPlatform(true)) {

    let controller = new LiveDomVisitorController();
    let ownerId = LinkUtil.GetPeerID();

    controller.SwPeer = new SWPeer(controller, ownerId, () => {
    });
}
