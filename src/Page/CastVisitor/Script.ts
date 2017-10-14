﻿import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastVisitorController from "./CastVisitorController";

if (StdUtil.IsExecute()) {
    let videoElement = document.getElementById('sbj-video') as HTMLVideoElement;
    let ownerId = LinkUtil.GetPeerID();
    WebRTCService.Start(new CastVisitorController(), ownerId, () => {
        WebRTCService.CastRoomJoin(ownerId, videoElement);
    });
}
