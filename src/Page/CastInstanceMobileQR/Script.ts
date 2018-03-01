import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import SWPeer from "../../Base/WebRTC/SWPeer";
import CastInstanceMobileQRController from "./CastInstanceMobileQRController";


if (StdUtil.IsExecute(true)) {

    let controller = new CastInstanceMobileQRController();
    controller.SwPeer = new SWPeer(controller, null, null);
}