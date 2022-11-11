import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import StreamUtil from "../../Base/Util/StreamUtil";

import { DeviceView } from "../DeviceView/DeviceVew";
import { CameraResolutionView } from "../DeviceView/CameraResolutionView";

import CastInstanceController from "./CastInstanceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import LocalCache from "../../Contents/Cache/LocalCache";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import MdlUtil from "../../Contents/Util/MdlUtil";
import StreamChecker from "../../Base/Util/StreamChecker";
import { MessageUtil } from '../MessageModal/MessageUtil';


export default class CastInstanceView extends AbstractServiceView<CastInstanceController> {

    public Cursor: CastPropController;

    private _micDeviceView: DeviceView;
    private _camDeviceView: DeviceView;


    /**
     * 初期化処理
     */
    public async Initialize() {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
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

        let sbcResult = await StreamChecker.BlockCheck();

        if (sbcResult.IsBlock) {
            let msgUtil = new MessageUtil(document.getElementById("sbj-message-dialog") as HTMLElement);
            msgUtil.ShowModal(sbcResult.ErrorTitle, sbcResult.ErrorDetail);

        }

        this.SetMediaDevice();
        this.InitializeCursor();

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
        let accountCount = document.getElementById('sbj-cast-instance-account-count');
        let micElement = document.getElementById('mic-select-div');
        let camElement = document.getElementById('webcam-select-div');
        let camSizeElement = document.getElementById('webcam-size-select-div');

        let sfuElement = document.getElementById('sbj-check-sfu') as HTMLInputElement;
        let linkElement = document.getElementById('sbj-client-link');
        let noteElement = document.getElementById('sbj-livecast-note');

        startButton.hidden = isLiveCasting;
        stopButton.hidden = !isLiveCasting;
        accountCount.hidden = !isLiveCasting;
        micElement.hidden = isLiveCasting;
        camElement.hidden = isLiveCasting;
        camSizeElement.hidden = isLiveCasting;
        sfuElement.disabled = isLiveCasting;
        linkElement.hidden = !isLiveCasting;
        noteElement.hidden = isLiveCasting;
    }


    /** 
     * 
     */
    public StartStreaming() {
        let linkurl = LinkUtil.CreateLink("../CastVisitor/", this.Controller.SwPeer.PeerId);
        linkurl += "&sfu=" + (this.Controller.CastSetting.isSFU ? "1" : "0");
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        MdlUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

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
    public SetRoomName(room: Home.Room) {
        let title = (room ? room.name + "に配信" : "単体で配信");
        document.getElementById("sbj-livecast-room-name").innerText = title;
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

            var view = new DeviceView(DeviceKind.Video, textElement, listElement, devices, async (deviceId, deviceName) => {

                controller.VideoSource = deviceId;
                LocalCache.SetLiveCastOptions((opt) => opt.SelectCam = deviceId);
                this.ReadyCheck();

                try {
                    this.WaitOverlay(true);
                    let streamCheckers = await StreamChecker.GetRanges(deviceId, deviceName);

                    //  選択リストに解像度をセット
                    this.SetWebCameraSizeList(controller, streamCheckers);
                } finally {
                    this.WaitOverlay(false);
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
     * 
     * @param controller 
     * @param mscs 
     */
    private async SetWebCameraSizeList(controller: CastInstanceController, mscs: Array<MediaStreamConstraints>) {

        let msc = mscs[mscs.length - 1];
        let previewElement = document.getElementById('sbj-video') as HTMLVideoElement;
        let textElement = document.getElementById('webcam-size-select') as HTMLInputElement;
        var listElement = document.getElementById('webcam-size-list') as HTMLElement;

        var view = new CameraResolutionView(msc, textElement, listElement, mscs, async (selectMsc, dispResolution) => {

            controller.VideoMediaStreamConstraints = selectMsc;

            if (selectMsc) {
                StreamUtil.GetStreaming(selectMsc, (stream) => {
                    StreamUtil.StartPreview(previewElement, stream);
                }, (errname) => {
                    alert(errname);
                });
            }
            else {
                StreamUtil.StopPreview(previewElement);
            }

        });

        view.SelectLastCameraResolution();
        document.getElementById("webcam-size-select-div").classList.add("is-dirty");

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
     * 
     */
    private WaitOverlay(isOverlay: boolean) {
        document.getElementById("sbj-wait-overlay").hidden = !isOverlay;
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {
        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return CursorDispOffset.GetVideoDispOffset(video); });
        this.Cursor.DisplayAll();
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
