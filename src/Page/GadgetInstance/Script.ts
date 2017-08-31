import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LocalCache from "../../Base/Common/LocalCache";
import GadgetInstanceController from "./GadgetInstanceController";

if (StdUtil.IsExecute()) {
    WebRTCService.Start(new GadgetInstanceController(), LinkUtil.GetPeerID(), "GadgetInstance");
}