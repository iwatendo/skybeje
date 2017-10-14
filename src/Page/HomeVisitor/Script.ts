
import * as Home from "../../Base/IndexedDB/Home";

import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeVisitorController from "./HomeVisitorController";


if (StdUtil.IsExecute()) {

    let db = new Home.DB();

    db.Connect(() => {
        let server = new HomeVisitorController();
        let instanceId = LinkUtil.GetPeerID();
        WebRTCService.Start(server, instanceId, () => {
        });
    });

}
