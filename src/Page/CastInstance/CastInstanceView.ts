
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import { DeviceView } from "./Device/DeviceVew";
import CastInstanceController from "./CastInstanceController";
import { CastSettingSender, CastSpeechRecognitionSender } from "./CastInstanceContainer";

export default class CastInstanceView extends AbstractServiceView<CastInstanceController> {

    private _mainElement = document.getElementById("sbj-cast-instance-main");

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
        let pauseButton = document.getElementById('sbj-cast-instance-pause');
        let pauseRestart = document.getElementById('sbj-cast-instance-restart');
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
            this.Controller.SetStreaming();
            startButton.hidden = true;
            stopButton.hidden = false;
            accountCount.hidden = false;
            //  pauseButton.hidden = false;
            roomName.hidden = false;
            this.SetDisabled('mic-select');
            this.SetDisabled('webcam-select');

            var tooltips = document.getElementsByClassName("sbj-cast-instance-device-tooltip");
            for (let i = 0; i < tooltips.length; i++) {
                (tooltips.item(i) as HTMLElement).hidden = false;
            }
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


        //  Puaseボタン
        pauseButton.onclick = (e) => {
            WebRTCService.Puase = true;
            pauseButton.hidden = true;
            pauseRestart.hidden = false;
        }

        pauseRestart.onclick = (e) => {
            WebRTCService.Puase = false;
            pauseButton.hidden = false;
            pauseRestart.hidden = true;
        }

        let options = LocalCache.LiveCastOptions;

        //  音声認識チェック
        let speechRecCheckElement = document.getElementById('speech_recognition') as HTMLInputElement;
        speechRecCheckElement.onchange = (e) => {

            let isCheced = speechRecCheckElement.checked;
            LocalCache.SetLiveCastOptions((opt) => opt.IsSpeechRecognition = isCheced);

            this.Controller.CastSetting.dispSubtitles = isCheced;
            this.Controller.SendCastInfo();

            if (isCheced) {
                SpeechUtil.StartSpeechRecognition();
            } else {
                SpeechUtil.StopSpeechRecognition();
            }
        };
        speechRecCheckElement.checked = options.IsSpeechRecognition;
        this.Controller.CastSetting.dispSubtitles = options.IsSpeechRecognition;

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


        //  音声認識からのメッセージ取得
        SpeechUtil.InitSpeechRecognition((message) => {
            let send = new CastSpeechRecognitionSender(message);
            WebRTCService.SendToAll(send);
        });

        this.SetMediaDevice();

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
        let message = "「" + room.name + "」に\nライブキャストしています";
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
     * Video/Audioソースの取得とリストへのセット
     */
    public SetMediaDevice() {

        let controller = this.Controller;

        let preMic = LocalCache.LiveCastOptions.SelectMic;
        let preCam = LocalCache.LiveCastOptions.SelectCam;
        let isInit = (!preMic && !preCam);

        DeviceUtil.GetAudioDevice((devices) => {

            let textElement = document.getElementById('mic-select') as HTMLInputElement;
            var listElement = document.getElementById('mic-list') as HTMLElement;

            var view = new DeviceView(this.Controller, textElement, listElement, devices, (deviceId, deviceName) => {
                controller.AudioSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectMic = deviceName);
                this.ChnageDevice();
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preMic);
            }

            document.getElementById("mic-select-div").classList.add("is-dirty");
            this.ChnageDevice();
        });

        DeviceUtil.GetVideoDevice((devices) => {

            let textElement = document.getElementById('webcam-select') as HTMLInputElement;
            var listElement = document.getElementById('webcam-list') as HTMLElement;

            var view = new DeviceView(this.Controller, textElement, listElement, devices, (deviceId, deviceName) => {

                controller.VideoSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectCam = deviceName);
                this.ChnageDevice();

                if (deviceId) {
                    WebRTCService.SetPreview(deviceId, true, document.getElementById('video'));
                }
                else {
                    WebRTCService.StopPreview();
                }
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preCam);
            }

            document.getElementById("webcam-select-div").classList.add("is-dirty");
            this.ChnageDevice();
        });

    }


    /**
     * デバイス変更時の共通処理
     */
    public ChnageDevice() {
        let startButton = document.getElementById('sbj-cast-instance-start') as HTMLButtonElement;
        let options = LocalCache.LiveCastOptions;
        startButton.disabled = !((options.SelectCam ? true : false) || (options.SelectMic ? true : false));
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
