
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import StreamUtil from "../../Base/Util/StreamUtil";
import LocalCache from "../../Contents/Cache/LocalCache";
import LinkUtil from "../../Base/Util/LinkUtil";

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

        window.onload = () => {
            if (!StreamUtil.IsEnabledExtension()) {
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
            this.Controller.CastInstance.isHide = false;
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
                document.getElementById("sbj-screenshare-setting").hidden = true;
                startButton.hidden = true;
                stopButton.hidden = false;
                accountCount.hidden = false;
                roomName.hidden = false;
                note.hidden = true;
            });
        };

        //  ストリーミング停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.ServerSend(false, false);
            location.href = "";
        };


        //  カーソル表示有無
        let cursorDispElement = document.getElementById('cursor_disp') as HTMLInputElement;
        cursorDispElement.onchange = (e) => {

            let isCheced = cursorDispElement.checked;
            LocalCache.SetScreenShareOptions((opt) => opt.IsIconCursor = isCheced);

            this.Controller.CastSetting.dispUserCursor = isCheced;
            this.Controller.SendCastInfo();
        };


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


    public SetLinkUrlEvent() {
        //  接続URLのコピー
        let linkurl = LinkUtil.CreateLink("../CastVisitor", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLInputElement;
        LinkUtil.SetCopyLinkButton(clipcopybtn, linkurl);
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
        this.Controller.CastInstance.isHide = this.Controller.CastInstance.isCasting;
        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastInstance.isClose = !this.Controller.CastInstance.isCasting;
        this.Controller.SendCastInfo();
    }

}
