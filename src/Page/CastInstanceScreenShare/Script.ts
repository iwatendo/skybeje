import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceScreenShareController from "./CastInstanceScreenShareController";

if (StdUtil.IsExecute()) {
    WebRTCService.Start(new CastInstanceScreenShareController(), LinkUtil.GetPeerID());
}