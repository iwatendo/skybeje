import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveDomVisitorController from "./LiveDomVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LiveDomMessageSender from "../../Contents/Sender/LiveDomMessageSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";

let controller: LiveDomVisitorController;

if (StdUtil.IsSupoortPlatform(true)) {

    controller = new LiveDomVisitorController();
    let ownerId = LinkUtil.GetPeerID();

    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        (window as any).skybejeSend = skybejeSend;
    });
}


function skybejeSend(message: string) {
    let sender = new LiveDomMessageSender();
    sender.text = message;
    sender.peerid = controller.SwPeer.PeerId;

    if (controller.View.Cursor) {
        sender.iconCurosr = controller.View.Cursor.IconCursor;
    }

    controller.SwPeer.SendToOwner(sender);
}