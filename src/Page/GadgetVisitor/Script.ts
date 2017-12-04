import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import GadgetVisitorController from "./GadgetVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";

if (StdUtil.IsExecute()) {
    let controller = new GadgetVisitorController();
    controller.SwPeer = new SWPeer(controller, LinkUtil.GetPeerID(), null);
}
