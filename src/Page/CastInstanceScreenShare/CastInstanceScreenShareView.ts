import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import StreamUtil from "../../Base/Util/StreamUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import * as Home from "../../Contents/IndexedDB/Home";
import LocalCache from "../../Contents/Cache/LocalCache";
import CastInstanceScreenShareController from "./CastInstanceScreenShareController";

export default class CastInstanceScreenShareView extends AbstractServiceView<CastInstanceScreenShareController> {

    protected _mainElement = document.getElementById("sbj-cast-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchmove();
        let backpanel = document.getElementById('sbj-cast-instance');
        let startButton = document.getElementById('sbj-cast-instance-start');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let note = document.getElementById('sbj-screenshare-note');
        let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let framerateRange = document.getElementById('sbj-screenshare-framerate') as HTMLInputElement;
        let framerateTip = document.getElementById('sbj-screenshare-framerate-tip');
        let option0 = document.getElementById('sbj-screenshare-option-0') as HTMLInputElement;
        let option1 = document.getElementById('sbj-screenshare-option-1') as HTMLInputElement;
        let option2 = document.getElementById('sbj-screenshare-option-2') as HTMLInputElement;
        let option3 = document.getElementById('sbj-screenshare-option-3') as HTMLInputElement;
        let option4 = document.getElementById('sbj-screenshare-option-4') as HTMLInputElement;

        let mainElement = document.getElementById('sbj-cast-instance-main');
        let noExtElement = document.getElementById('sbj-cast-instance-main-no-extension');
        let linkElement = document.getElementById('sbj-client-link');

        window.onload = () => {

            let isDebug = false;

            if (!StreamUtil.IsEnabledExtension() && !isDebug) {
                mainElement.hidden = true;
                noExtElement.hidden = false;
            }
        }

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                this.Close();
            }
        };

        window.onfocus = (ev) => {
            this.Controller.CastStatus.isHide = false;
        }

        framerateRange.onmousemove = (e) => {
            framerateTip.textContent = framerateRange.value.toString();
        }

        framerateRange.onchange = (e) => {
            framerateTip.textContent = framerateRange.value.toString();
        }

        //  ストリーミング開始ボタン
        startButton.onclick = (e) => {

            let option = 0;
            let width = 0;
            let height = 0;
            if (option0.checked) { option = 0; }
            if (option1.checked) { option = 1; width = 512; height = 384; }
            if (option2.checked) { option = 2; width = 640; height = 360; }
            if (option3.checked) { option = 3; width = 800; height = 600; }
            if (option4.checked) { option = 4; width = 960; height = 540; }
            let fr = Number.parseInt(framerateRange.value);

            LocalCache.SetScreenShareOptions((opt) => {
                opt.Resolution = option;
                opt.FrameRage = fr;
            });

            this.Controller.SetStreaming(width, height, fr, () => {
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
            location.href = "";
        };


        let checkSfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;
        let cursorDispElement = document.getElementById('sbj-check-cursor-disp') as HTMLInputElement;
        //
        checkSfuElement.onchange = (e) => { this.SendOption(); }
        cursorDispElement.onchange = (e) => { this.SendOption(); }


        //  初期値設定
        let options = LocalCache.ScreenShareOptions;
        if (options) {

            cursorDispElement.checked = options.IsIconCursor;
            this.Controller.CastSetting.dispUserCursor = options.IsIconCursor;

            framerateRange.value = options.FrameRage.toString();
            switch (options.Resolution) {
                case 0: option0.checked = true; break;
                case 1: option1.checked = true; break;
                case 2: option2.checked = true; break;
                case 3: option3.checked = true; break;
                case 4: option4.checked = true; break;
            }
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
        this.Controller.CastSetting.dispUserCursor = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        LocalCache.SetScreenShareOptions((opt) => opt.IsIconCursor = this.Controller.CastSetting.dispUserCursor);
        this.Controller.SendCastInfo();
    }


    /** 
     * 
     */
    public SetClientLink() {
        let linkurl = LinkUtil.CreateLink("../CastVisitor", this.Controller.SwPeer.PeerId);
        linkurl += "&sfu=" + (this.Controller.CastSetting.isSFU ? "1" : "0");
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, clipcopybtn, clientopenbtn, qrcode);
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
    public SetRoom(room: Home.Room) {
        let message = "「" + room.name + "」に配信中";
        document.getElementById("sbj-livecast-room-name").innerText = message;
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
