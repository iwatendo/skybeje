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
        this.SetLiveCastQRCode();

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
    public SetLiveCastQRCode() {

        this.ChangeDisplay(false, false);
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


    /**
     * 
     */
    public GetOption(): CastSettingSender {
        let sender = new CastSettingSender();
        sender.isSFU = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
        sender.useCastProp = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        return sender;
    }


    public SendOption() {
        let sender = this.GetOption();
        this.Controller.SwPeer.SendAll(sender);
    }

    /**
     * 
     */
    public SetCastStauts(castStatus: CastStatusSender) {

        if (castStatus.isCasting) {
            let isSfu = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
            let linkurl = castStatus.clientUrl;
            linkurl += "&sfu=" + (isSfu ? "1" : "0");
            let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
            let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
            let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
            LinkUtil.SetCopyLinkButton(linkurl, clipcopybtn, clientopenbtn, qrcode);

            this.ChangeDisplay(true, true);
        }

    }


    /**
     * 画面の表示制御
     * @param isMobileConnect 
     * @param isLiveCast 
     */
    public ChangeDisplay(isMobileConnect: boolean, isLiveCast: boolean) {
        document.getElementById('sbj-cast-instance-account-count').hidden = !(isMobileConnect && isLiveCast);
        document.getElementById("sbj-terminal-info").hidden = !isMobileConnect;
        document.getElementById("sbj-cast-setting").hidden = isMobileConnect;
        document.getElementById('sbj-livecast-note').hidden = isMobileConnect;
        (document.getElementById("sbj-check-sfu") as HTMLInputElement).disabled = isMobileConnect;
        document.getElementById('sbj-client-link').hidden = !isLiveCast;
    }

    /**
     * 
     * @param info 
     */
    public SetTerminalInfo(info: TerminalInfoSender) {

        this.ChangeDisplay(true, false);

        let sfuElement = document.getElementById("sbj-check-sfu") as HTMLInputElement;

        if (StdUtil.IsIOS(info.userAgent)) {
            //  現状、SafariはSFUに対応していない為、強制的にSFUの使用を不可にする。
            sfuElement.checked = false;
            document.getElementById('sbj-check-sfu-label').classList.remove('is-checked');
            this.SendOption();
            //  同時接続数の警告を表示
            document.getElementById('sbj-ios-warning').hidden = false;
        }

        document.getElementById('sbj-platform').textContent = info.platform;
        document.getElementById('sbj-appversion').textContent = info.appVersion;
        document.getElementById('sbj-useragent').textContent = info.userAgent;
    }

}
