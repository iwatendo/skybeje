import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastStatusSender from "../../Base/Container/CastStatusSender";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";

export default class CastInstanceMobileQRView extends AbstractServiceView<CastInstanceMobileQRController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        this.SetQRCode();

        (document.getElementById('option_sfu') as HTMLInputElement).onchange = (e) => { this.SendOption() }
        (document.getElementById('option_cursor') as HTMLInputElement).onchange = (e) => { this.SendOption() }

        callback();
    }


    /**
     * 
     */
    public SetQRCode() {
        let peerid = LinkUtil.GetPeerID();
        let linkurl = LinkUtil.CreateLink("../CastInstanceMobile/", this.Controller.SwPeer.PeerId);

        let element = document.getElementById('sbj-mobile-qrcode') as HTMLFrameElement;
        element.src = LinkUtil.CreateLink("../QrCode/") + "?linkurl=" + encodeURIComponent(linkurl);
    }


    public SendOption() {
        let sender = new CastSettingSender();
        sender.isSFU = (document.getElementById('option_sfu') as HTMLInputElement).checked;
        sender.dispUserCursor = (document.getElementById('option_cursor') as HTMLInputElement).checked;
        this.Controller.SwPeer.SendAll(sender);
    }


    /**
     * 
     */
    public SetCastStauts(castStatus: CastStatusSender) {

        if (castStatus.isCasting) {

            let linkurl = castStatus.clientUrl;
            let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLInputElement;
            LinkUtil.SetCopyLinkButton(clipcopybtn, linkurl);

            document.getElementById('sbj-linkcopy').hidden = false;
        }
    }

}
