import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import * as Home from "../../Contents/IndexedDB/Home";
import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import MdlUtil from "../../Contents/Util/MdlUtil";

export default class CastInstanceScreenShareView extends AbstractServiceView<CastInstanceScreenShareController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        let startButton = document.getElementById('sbj-cast-instance-start');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let note = document.getElementById('sbj-livecast-note');
        let accountCount = document.getElementById('sbj-cast-instance-account-count');

        let settingElement = document.getElementById('sbj-screenshare-setting');
        let linkElement = document.getElementById('sbj-client-link');

        window.onload = () => {
            startButton.hidden = false;
        }

        window.onfocus = (ev) => {
            this.Controller.CastStatus.isHide = false;
        }


        //  ストリーミング開始ボタン
        startButton.onclick = (e) => {

            this.Controller.SetStreaming(() => {
                startButton.hidden = true;
                stopButton.hidden = false;
                accountCount.hidden = false;
                roomName.hidden = false;
                note.hidden = true;
                linkElement.hidden = false;
                this.SetClientLink();
                this.SetDisabled(true);
            });

        };

        //  ストリーミング停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.ServerSend(false, false);
            this.Controller.PageReLoad();
        };


        let checkSfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;
        let cursorDispElement = document.getElementById('sbj-check-cursor-disp') as HTMLInputElement;
        //
        checkSfuElement.onchange = (e) => { this.SendOption(); }
        cursorDispElement.onchange = (e) => { this.SendOption(); }

        //  単体配信の場合
        if (!LinkUtil.GetPeerID()) {
            this.SetRoomName(null);
        }

        callback();
    }


    public InitializeChatLink() {
        document.getElementById('sbj-check-cursor-disp-label').hidden = false;
    }


    /**
     * 
     * @param isStreaming 
     */
    public SetDisabled(isStreaming: boolean) {
        let chkSfu = document.getElementById("sbj-check-sfu") as HTMLInputElement;
        chkSfu.disabled = isStreaming;
    }


    /** 
     * 
     */
    public SendOption() {
        this.Controller.CastSetting.isSFU = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
        this.Controller.CastSetting.useCastProp = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        this.Controller.SendCastInfo();
    }


    /** 
     * 
     */
    public SetClientLink() {
        let linkurl = LinkUtil.CreateLink("../CastVisitor/", this.Controller.SwPeer.PeerId);
        linkurl += "&sfu=" + (this.Controller.CastSetting.isSFU ? "1" : "0");
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        MdlUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-cast-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoomName(room: Home.Room) {
        let title = (room ? room.name + "に配信" : "スクリーンシェア配信");
        document.getElementById("sbj-livecast-room-name").innerText = title;
    }


    /**
     * フレームを閉じる
     */
    public Close() {
        //  ストリーミング中の場合は表示を切替える
        this.Controller.CastStatus.isHide = this.Controller.CastStatus.isCasting;
        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastStatus.isClose = !this.Controller.CastStatus.isCasting;
        this.Controller.SendCastInfo();
    }

}
