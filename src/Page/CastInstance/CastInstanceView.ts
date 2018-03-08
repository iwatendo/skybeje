
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";
import LogUtil from "../../Base/Util/LogUtil";
import StreamUtil from "../../Base/Util/StreamUtil";

import { DeviceView } from "../DeviceView/DeviceVew";
import CastInstanceController from "./CastInstanceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import { DialogMode } from "../../Contents/AbstractDialogController";
import LocalCache from "../../Contents/Cache/LocalCache";

export default class CastInstanceView extends AbstractServiceView<CastInstanceController> {

    private _micDeviceView: DeviceView;
    private _camDeviceView: DeviceView;


    /**
     * 初期化処理
     */
    public Initialize() {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        let backpanel = document.getElementById('sbj-cast-instance');
        let startButton = document.getElementById('sbj-cast-instance-start');
        let cancelButton = document.getElementById('sbj-cast-instance-cancel');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let micElement = document.getElementById('mic-select-div');
        let camElement = document.getElementById('webcam-select-div');

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                this.Close();
            }
        };

        window.onfocus = (ev) => {
            if (this.Controller && this.Controller.CastStatus) {
                this.Controller.CastStatus.isHide = false;
            }
        }

        //  ストリーミング開始ボタン
        startButton.onclick = (e) => {
            this.ChangeDisplayMode(true);
            this.StartStreaming();
        }

        //  ストリーミング停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.ServerSend(false, false);
            location.href = "";
        };

        let options = LocalCache.LiveCastOptions;

        let checkSfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;
        let cursorDispElement = document.getElementById('sbj-check-cursor-disp') as HTMLInputElement;

        //
        checkSfuElement.onchange = (e) => { this.SendOption(); }
        cursorDispElement.onchange = (e) => { this.SendOption(); }

        this.SetMediaDevice();
    }


    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
    }


    public SendOption() {
        this.Controller.CastSetting.isSFU = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
        this.Controller.CastSetting.dispUserCursor = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        this.Controller.SendCastInfo();
    }

    /**
     * 
     * @param isLiveCasting 
     */
    public ChangeDisplayMode(isLiveCasting: boolean) {

        let startButton = document.getElementById('sbj-cast-instance-start');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let micElement = document.getElementById('mic-select-div');
        let camElement = document.getElementById('webcam-select-div');
        let linkElement = document.getElementById('sbj-client-link');
        let sfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;

        startButton.hidden = isLiveCasting;
        stopButton.hidden = !isLiveCasting;
        accountCount.hidden = !isLiveCasting;
        roomName.hidden = !isLiveCasting;
        micElement.hidden = isLiveCasting;
        camElement.hidden = isLiveCasting;
        linkElement.hidden = !isLiveCasting;
        sfuElement.disabled = isLiveCasting;
    }


    /** 
     * 
     */
    public StartStreaming() {
        let linkurl = LinkUtil.CreateLink("../CastVisitor", this.Controller.SwPeer.PeerId);
        linkurl += "&sfu=" + (this.Controller.CastSetting.isSFU ? "1" : "0");
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, clipcopybtn, clientopenbtn, qrcode);

        this.Controller.SetStreaming();
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

            var view = new DeviceView(DeviceKind.Audio, textElement, listElement, devices, (deviceId, deviceName) => {
                controller.AudioSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectMic = deviceId);
                this.ChnageDevice();
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preMic);
            }

            this._micDeviceView = view;
            document.getElementById("mic-select-div").classList.add("is-dirty");
            this.ChnageDevice();
        });

        DeviceUtil.GetVideoDevice((devices) => {

            let previewElement = document.getElementById('video') as HTMLVideoElement;
            let textElement = document.getElementById('webcam-select') as HTMLInputElement;
            var listElement = document.getElementById('webcam-list') as HTMLElement;

            var view = new DeviceView(DeviceKind.Video, textElement, listElement, devices, (deviceId, deviceName) => {

                controller.VideoSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectCam = deviceId);
                this.ChnageDevice();

                if (deviceId) {
                    let msc = StreamUtil.GetMediaStreamConstraints(deviceId, null);
                    StreamUtil.GetStreaming(msc, (stream) => {
                        StreamUtil.StartPreview(previewElement, stream);
                    }, (errname) => {
                        alert(errname);
                    });
                }
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preCam);
            }

            this._camDeviceView = view;
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
        this.Controller.CastStatus.isHide = this.Controller.CastStatus.isCasting;
        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastStatus.isClose = !this.Controller.CastStatus.isCasting;
        this.Controller.SendCastInfo();
    }

}
