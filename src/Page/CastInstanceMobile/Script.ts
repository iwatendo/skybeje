import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceMobileController from "./CastInstanceMobileController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import LocalCache from "../../Contents/Cache/LocalCache";

if (StdUtil.IsExecute(true)) {

    if (!LocalCache.IsCheckDevicePermision) {
        let reload = () => {
            LocalCache.IsCheckDevicePermision = true;
            location.reload();
        };
        navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        navigator.getUserMedia({ video: true, audio: true }, (stream) => { reload(); }, (err) => { reload(); });
    }

    let controller = new CastInstanceMobileController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
    });
}