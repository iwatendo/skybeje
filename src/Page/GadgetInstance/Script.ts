import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import GadgetInstanceController from "./GadgetInstanceController";
import SWPeer from "../../Base/WebRTC/SWPeer";

if (StdUtil.IsExecute()) {
    let controller = new GadgetInstanceController();
    controller.SwPeer = new SWPeer(controller, LinkUtil.GetPeerID(), null);
}