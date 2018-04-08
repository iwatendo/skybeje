import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveHTMLInstanceController from "./LiveHTMLInstanceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";

if (StdUtil.IsSupoortPlatform(true)) {

    let controller = new LiveHTMLInstanceController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
    });
}