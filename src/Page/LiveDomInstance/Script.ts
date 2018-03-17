import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveDomInstanceController from "./LiveDomInstanceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";

if (StdUtil.IsSupoortPlatform(true)) {

    let controller = new LiveDomInstanceController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
    });
}