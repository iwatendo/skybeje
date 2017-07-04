import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceController from "./CastInstanceController";

if (StdUtil.IsExecute()) {

    navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;

    navigator.getUserMedia(
        { video: true, audio: true },
        (stream) => {
            WebRTCService.Start(new CastInstanceController(true), LinkUtil.GetPeerID(), "CastInstance");
        }, (e) => {
            alert(e);
            WebRTCService.Start(new CastInstanceController(false), LinkUtil.GetPeerID(), "CastInstance");
        }
    );
}