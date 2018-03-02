import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastStatusSender from "../../Base/Container/CastStatusSender";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import TerminalInfoSender from "../../Contents/Sender/TerminalInfoSender";

export default class CastInstanceMobileQRView extends AbstractServiceView<CastInstanceMobileQRController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        this.SetQRCode();

        (document.getElementById('sbj-check-sfu') as HTMLInputElement).onchange = (e) => { this.SendOption() }
        (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).onchange = (e) => { this.SendOption() }

        callback();
    }


    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
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


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        let element = document.getElementById('sbj-cast-instance-account-count');
        element.setAttribute("data-badge", count.toString());
    }


    public SendOption() {
        let sender = new CastSettingSender();
        sender.isSFU = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
        sender.dispUserCursor = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
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


    /**
     * 
     * @param info 
     */
    public SetTerminalInfo(info: TerminalInfoSender) {

        document.getElementById('sbj-cast-instance-account-count').hidden = false;
        document.getElementById("sbj-cast-setting").hidden = true;

        if (StdUtil.IsSafari(info.userAgent)) {
            (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked = false;
            this.SendOption();
        }

        document.getElementById("sbj-terminal-info").hidden = false;

        document.getElementById('sbj-platform').textContent = info.platform;
        document.getElementById('sbj-appversion').textContent = info.appVersion;
        document.getElementById('sbj-useragent').textContent = info.userAgent;
    }

}
