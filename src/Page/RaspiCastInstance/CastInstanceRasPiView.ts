﻿
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import StreamUtil from "../../Base/Util/StreamUtil";

import { DeviceView } from "../DeviceView/DeviceVew";
import CastInstanceControllerRasPi from "./CastInstanceRasPiController";
import LinkUtil from "../../Base/Util/LinkUtil";
import LocalCache from "../../Contents/Cache/LocalCache";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import MdlUtil from "../../Contents/Util/MdlUtil";

export default class CastInstanceViewRasPi extends AbstractServiceView<CastInstanceControllerRasPi> {

    public Cursor: CastPropController;

    private _micDeviceView: DeviceView;
    private _camDeviceView: DeviceView;


    /**
     * 初期化処理
     */
    public Initialize() {

        let startButton = document.getElementById('sbj-cast-instance-start');
        let stopButton = document.getElementById('sbj-cast-instance-stop');

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

        this.SetMediaDevice();
        this.InitializeCursor();

        setTimeout(() => {
            this.ChangeDisplayMode(true);
            this.StartStreaming();
        }, 5000);
    }


    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
    }


    public SendOption() {
        this.Controller.CastSetting.isSFU = (document.getElementById('sbj-check-sfu') as HTMLInputElement).checked;
        this.Controller.CastSetting.useCastProp = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        this.Controller.SendCastInfo();
    }

    /**
     * 
     * @param isLiveCasting 
     */
    public ChangeDisplayMode(isLiveCasting: boolean) {

        let startButton = document.getElementById('sbj-cast-instance-start');
        let stopButton = document.getElementById('sbj-cast-instance-stop');
        //  let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let micElement = document.getElementById('mic-select-div');
        let camElement = document.getElementById('webcam-select-div');
        let sfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;
        let linkElement = document.getElementById('sbj-client-link');

        startButton.hidden = isLiveCasting;
        stopButton.hidden = !isLiveCasting;
        //  accountCount.hidden = !isLiveCasting;
        micElement.hidden = isLiveCasting;
        camElement.hidden = isLiveCasting;
        sfuElement.disabled = isLiveCasting;
        linkElement.hidden = !isLiveCasting;
    }


    /** 
     * 
     */
    public StartStreaming() {
        let linkurl = LinkUtil.CreateLink("../RasPiCastVisitor/", this.Controller.SwPeer.PeerId);
        linkurl += "&sfu=" + (this.Controller.CastSetting.isSFU ? "1" : "0");
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        MdlUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);
        this.Controller.SetStreaming();

        //  試験実装
        var fd = new FormData();
        fd.append('key', linkurl);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/raspitest/keyset.php');
        xhr.send(fd);
        xhr.onreadystatechange = function () {
            if ((xhr.readyState == 4) && (xhr.status == 200)) {
                //  _returnValues = JSON.parse(xhr.responseText);
            }
        };
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        //  document.getElementById("sbj-cast-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoomName(room: Home.Room) {
        //  let title = (room ? room.name + "に配信" : "単体で配信");
        //  document.getElementById("sbj-livecast-room-name").innerText = title;
        this.ReadyCheck();
    }


    /**
     * 配信開始可能か確認
     */
    public ReadyCheck() {

        let disabled = true;

        //  配信先のチャットルームが確定かつ、カメラまたはマイクデバイスが選択されている場合
        //  配信開始ボタン押下を許可
        if (this.Controller.IsReady()) {
            let options = LocalCache.LiveCastOptions;
            disabled = !((options.SelectCam ? true : false) || (options.SelectMic ? true : false));
        }

        let startButton = document.getElementById('sbj-cast-instance-start') as HTMLButtonElement;
        startButton.disabled = disabled;
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
                this.ReadyCheck();
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preMic);
            }

            this._micDeviceView = view;
            document.getElementById("mic-select-div").classList.add("is-dirty");
            this.ReadyCheck();
        });

        DeviceUtil.GetVideoDevice((devices) => {

            let previewElement = document.getElementById('sbj-video') as HTMLVideoElement;
            let textElement = document.getElementById('webcam-select') as HTMLInputElement;
            var listElement = document.getElementById('webcam-list') as HTMLElement;

            var view = new DeviceView(DeviceKind.Video, textElement, listElement, devices, (deviceId, deviceName) => {

                controller.VideoSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectCam = deviceId);
                this.ReadyCheck();

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
            this.ReadyCheck();
        });

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


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {
        //  let video = document.getElementById('sbj-video') as HTMLVideoElement;
        //  let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        //  let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;
        //  this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return CursorDispOffset.GetVideoDispOffset(video); });
        //  this.Cursor.DisplayAll();
    }


    /**
     * プライベート配信の設定変更
     * @param sender
     */
    public SetCastSetting(sender: CastSettingSender) {

        if (this.Cursor) {
            if (!sender.useCastProp) {
                this.Cursor.Clear();
            }
        }
    }


}
