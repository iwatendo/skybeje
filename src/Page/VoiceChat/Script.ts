import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import VoiceChatController from "./VoiceChatController";
import SWPeer from "../../Base/WebRTC/SWPeer";


if (StdUtil.IsSupoortPlatform(true)) {

    let server = new VoiceChatController();
    server.SwPeer = new SWPeer(server, LinkUtil.GetPeerID(), null);

}
