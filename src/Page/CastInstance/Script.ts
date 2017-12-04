import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LocalCache from "../../Base/Common/LocalCache";
import CastInstanceController from "./CastInstanceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";

if (StdUtil.IsExecute(true)) {

    if (!LocalCache.IsCheckDevicePermision) {
        let reload = () => {
            LocalCache.IsCheckDevicePermision = true;
            location.reload();
        };
        navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        navigator.getUserMedia({ video: true, audio: true }, (stream) => { reload(); }, (err) => { reload(); });
    }

    let controller = new CastInstanceController();
    let ownerId = LinkUtil.GetPeerID();
    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        //  PeerIDをルーム名称とする
        let roomname = controller.SwPeer.PeerId;
        controller.SwRoom = new SWRoom(controller, controller, controller.SwPeer.Peer, roomname, SWRoomMode.SFU);
    });
}