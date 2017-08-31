﻿import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import GadgetVisitorController from "./GadgetVisitorController";

if (StdUtil.IsExecute()) {
    WebRTCService.Start(new GadgetVisitorController(), LinkUtil.GetPeerID(), "GadgetVisitor");
}