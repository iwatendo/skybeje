import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import MobileCastSettingSender from "../../Contents/Sender/MobileCastSettingSender";

export default class CastInstanceMobileQRView extends AbstractServiceView<CastInstanceMobileQRController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        this.SetQRCode();

        (document.getElementById('option_sfu') as HTMLInputElement).onchange = (e) => { this.ChangeOption() }
        (document.getElementById('option_rear') as HTMLInputElement).onchange = (e) => { this.ChangeOption() }
        (document.getElementById('option_cursor') as HTMLInputElement).onchange = (e) => { this.ChangeOption() }

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


    public ChangeOption() {
        let sender = new MobileCastSettingSender();
        sender.isSFU = (document.getElementById('option_sfu') as HTMLInputElement).checked;
        sender.isRearCamera = (document.getElementById('option_rear') as HTMLInputElement).checked;
        sender.isDispCursor = (document.getElementById('option_cursor') as HTMLInputElement).checked;
    }


    /**
     * 
     */
    public SetLinkUrlEvent() {
        //  接続URLのコピー
        let linkurl = LinkUtil.CreateLink("../CastVisitor", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLInputElement;
        LinkUtil.SetCopyLinkButton(clipcopybtn, linkurl);
    }

}
