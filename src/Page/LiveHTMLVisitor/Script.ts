import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveHTMLVisitorController from "./LiveHTMLVisitorController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LiveHTMLMessageSender from "../../Contents/Sender/LiveHTMLMessageSender";
import IconCursorSender from "../../Contents/Sender/IconCursorSender";

let controller: LiveHTMLVisitorController;

if (StdUtil.IsSupoortPlatform(true)) {

    controller = new LiveHTMLVisitorController();
    let ownerId = LinkUtil.GetPeerID();

    controller.SwPeer = new SWPeer(controller, ownerId, () => {
        (window as any).skybejeSend = skybejeSend;
    });
}


function skybejeSend(message: string) {
    let sender = new LiveHTMLMessageSender();
    sender.text = message;
    sender.peerid = controller.SwPeer.PeerId;

    if (controller.View.Cursor) {
        sender.iconCurosr = controller.View.Cursor.IconCursor;
    }

    controller.SwPeer.SendToOwner(sender);
}