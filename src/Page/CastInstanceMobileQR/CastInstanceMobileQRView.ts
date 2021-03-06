﻿import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import CastInstanceMobileQRController from "./CastInstanceMobileQRController";
import CastStatusSender from "../../Base/Container/CastStatusSender";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import TerminalInfoSender from "../../Contents/Sender/TerminalInfoSender";
import MapLocationSender from "../../Contents/Sender/MapLocationSender";
import GMapsUtil from "../../Contents/Util/GMapsUtil";
import PictureSender from "../../Contents/Sender/PictureSender";
import { Room } from "../../Contents/IndexedDB/Home";
import MdlUtil from "../../Contents/Util/MdlUtil";

export default class CastInstanceMobileQRView extends AbstractServiceView<CastInstanceMobileQRController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        //  単体配信の場合
        if (!LinkUtil.GetPeerID()) {
            this.SetRoomName(null);
        }

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
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoomName(room: Room) {
        let title = (room ? room.name + "に配信" : "単体で配信");
        document.getElementById("sbj-livecast-room-name").innerText = title;
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

            //  モバイル端末の回転通知の場合は何もしない
            if (castStatus.isOrientationChange) {
                return;
            }

            let isSfu = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
            let linkurl = castStatus.clientUrl;
            linkurl += "&sfu=" + (isSfu ? "1" : "0");
            let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
            let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
            let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
            MdlUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

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
        document.getElementById('sbj-livecast-note').hidden = isLiveCast;
        (document.getElementById("sbj-check-sfu") as HTMLInputElement).disabled = isMobileConnect;
        document.getElementById('sbj-client-link').hidden = !isLiveCast;
    }


    /**
     * 
     * @param info 
     */
    public SetTerminalInfo(info: TerminalInfoSender) {

        this.ChangeDisplay(true, false);

        document.getElementById('sbj-platform').textContent = info.platform;
        document.getElementById('sbj-appversion').textContent = info.appVersion;
        document.getElementById('sbj-useragent').textContent = info.userAgent;

        document.getElementById('sbj-location-info').hidden = true;
        document.getElementById('sbj-picture-info').hidden = true;
    }


    /**
     * 
     * @param map 
     */
    public SetMapLocation(map: MapLocationSender) {

        let pos = map.Location.latitude + "," + map.Location.longitude;
        let url = "https://maps.google.com/maps?q=" + pos;
        document.getElementById('sbj-location').textContent = pos;
        document.getElementById('sbj-googlemap-link').setAttribute("href", url);

        if (map.Location) {
            GMapsUtil.GetAddress(map.Location, (address) => {
                document.getElementById('sbj-geocode-address').textContent = address;
            });
        }
        document.getElementById('sbj-location-info').hidden = false;
    }


    /**
     * 写真の表示
     * @param pic 
     */
    public SetPicture(pic: PictureSender) {
        document.getElementById('sbj-picture-info').hidden = false;
        let element = document.getElementById('sbj-picture') as HTMLImageElement;
        element.src = pic.src;
    }

}
