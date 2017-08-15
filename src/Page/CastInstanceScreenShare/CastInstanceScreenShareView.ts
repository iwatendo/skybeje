
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

        //  ストリーミング開始ボタン
        startButton.onclick = (e) => {
            this.Controller.SetStreaming(()=>{
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
