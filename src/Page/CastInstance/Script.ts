import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastInstanceController from "./CastInstanceController";

if (StdUtil.IsExecute()) {
    WebRTCService.Start(new CastInstanceController(), LinkUtil.GetPeerID(), "CastInstance");
}
