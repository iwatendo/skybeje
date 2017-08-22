
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import GadgetInstanceController from "./GadgetInstanceController";
import { GadgetCastSettingSender } from "./GadgetInstanceContainer";

export default class GadgetInstanceView extends AbstractServiceView<GadgetInstanceController> {

    private _mainElement = document.getElementById("sbj-gadget-instance-main");

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchmove();
        let backpanel = document.getElementById('sbj-gadget-instance');
        let startButton = document.getElementById('sbj-gadget-instance-start');
        let cancelButton = document.getElementById('sbj-gadget-instance-cancel');
        let stopButton = document.getElementById('sbj-gadget-instance-stop');
        let pauseButton = document.getElementById('sbj-gadget-instance-pause');
        let pauseRestart = document.getElementById('sbj-gadget-instance-restart');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let accountCount = document.getElementById('sbj-gadget-instance-account-count');

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

        let options = LocalCache.LiveCastOptions;

        //  カーソル表示有無
        let cursorDispElement = document.getElementById('cursor_disp') as HTMLInputElement;
        cursorDispElement.onchange = (e) => {

            let isCheced = cursorDispElement.checked;
            LocalCache.SetLiveCastOptions((opt) => opt.IsIconCursor = isCheced);

            this.Controller.CastSetting.dispUserCursor = isCheced;
            this.Controller.SendCastInfo();
        };
        cursorDispElement.checked = options.IsIconCursor;
        this.Controller.CastSetting.dispUserCursor = options.IsIconCursor;

        callback();
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-gadget-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoom(room: Home.Room) {
        let message = "「" + room.name + "」に\nガジェットキャストしています";
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
