import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceController from "./CastInstanceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";

if (StdUtil.IsSupoortPlatform(true)) {

    if (!LocalCache.IsCheckDevicePermision) {
        let reload = () => {
            LocalCache.IsCheckDevicePermision = true;
            location.reload();
        };
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => { reload(); }).catch((err) => { reload(); });
    }
    else {
        let controller = new CastInstanceController();
        let ownerId = LinkUtil.GetPeerID();
        controller.SwPeer = new SWPeer(controller, ownerId, () => {
        });
    }
}