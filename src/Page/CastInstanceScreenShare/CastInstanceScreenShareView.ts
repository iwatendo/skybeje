
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import CastInstanceScreenShareController from "./CastInstanceScreenShareController";
import { CastSettingSender, CastSpeechRecognitionSender } from "../CastInstance/CastInstanceContainer";

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
        let cancelButton = document.getElementById('sbj-cast-instance-cancel');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let framerateRange = document.getElementById('sbj-screenshare-framerate') as HTMLInputElement;
        let framerateTip = document.getElementById('sbj-screenshare-framerate-tip');
        let option0 = document.getElementById('sbj-screenshare-option-0') as HTMLInputElement;
        let option1 = document.getElementById('sbj-screenshare-option-1') as HTMLInputElement;
        let option2 = document.getElementById('sbj-screenshare-option-2') as HTMLInputElement;
        let option3 = document.getElementById('sbj-screenshare-option-3') as HTMLInputElement;

        let mainElement = document.getElementById('sbj-cast-instance-main');
        let noExtElement = document.getElementById('sbj-cast-instance-main-no-extension');

        window.onload = () => {
            if (!WebRTCService.IsEnabledExtension()) {
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
            this.Controller.CastSetting.isControlHide = false;
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
            if (option1.checked) { option = 1; width = 640; height = 480; }
            if (option2.checked) { option = 2; width = 800; height = 600; }
            if (option3.checked) { option = 3; width = 1024; height = 768; }
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
            });
        };

        //  キャンセルボタン押下時
        cancelButton.onclick = (e) => {
            this.Close();
        };

        //  キー入力時イベント
        document.onkeydown = (e) => {
            //  エスケープキーはダイアログを閉じる
            if (e.keyCode === 27) {
                this.Close();
            }
        }

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
            }
        }

        callback();
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
        let message = "「" + room.name + "」に\nスクリーンシェアしています";
        document.getElementById("sbj-livecast-room-name").innerText = message;
    }


    /**
     * 
     */
    public SetDisabled(idname: string) {
        let element = document.getElementById(idname);
        element.setAttribute('disabled', 'true');
    }




    /**
     * フレームを閉じる
     */
    public Close() {
        //  ストリーミング中の場合は表示を切替える
        this.Controller.CastSetting.isControlHide = this.Controller.CastSetting.isStreaming;
        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastSetting.isControlClose = !this.Controller.CastSetting.isStreaming;
        this.Controller.SendCastInfo();
    }

}
