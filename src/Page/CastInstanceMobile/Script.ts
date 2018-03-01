import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceMobileController from "./CastInstanceMobileController";
import SWPeer from "../../Base/WebRTC/SWPeer";

if (StdUtil.IsExecute(true)) {
    let controller = new CastInstanceMobileController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        
    });
}