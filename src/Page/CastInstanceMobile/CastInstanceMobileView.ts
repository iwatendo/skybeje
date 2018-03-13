
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";
import LogUtil from "../../Base/Util/LogUtil";
import StreamUtil, { MobileCam } from "../../Base/Util/StreamUtil";

import { DeviceView } from "../DeviceView/DeviceVew";
import CastInstanceMobileController from "./CastInstanceMobileController";
import LinkUtil from "../../Base/Util/LinkUtil";
import { DialogMode } from "../../Contents/AbstractDialogController";
import LocalCache from "../../Contents/Cache/LocalCache";
import CursorController from "../CastProp/Cursor/CurosrController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import SubTitlesController from "../CastProp/SubTitles/SubTitlesController";

export default class CastInstanceMobileView extends AbstractServiceView<CastInstanceMobileController> {

    public SubTitles: SubTitlesController;
    public Cursor: CursorController;

    private _isAudioInit = false;
    private _preVolumeValue: string = "70";
    private static _mediaStream: MediaStream = null;
    private _audioContext: AudioContext = null;
    private _mediaStreamNode: MediaStreamAudioSourceNode = null;
    private _gainNode: GainNode = null;

    /**
     * 初期化処理
     */
    public Initialize(callback) {

        let subtitleElement = document.getElementById('sbj-cast-subtitles-text') as HTMLElement;
        this.SubTitles = new SubTitlesController(subtitleElement);

        (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        StdUtil.StopTouchZoom();

        let audioElement = document.getElementById('audio') as HTMLAudioElement;
        let startBotton = document.getElementById('sbj-cast-instance-start') as HTMLInputElement;
        let stopBotton = document.getElementById('sbj-cast-instance-stop');
        let camchangeBotton = document.getElementById('sbj-camchange') as HTMLInputElement;
        let volumeOn = document.getElementById("sbj-volume-button-on");
        let volumeOff = document.getElementById("sbj-volume-button-off");
        let sliderDiv = document.getElementById("sbj-volume");
        let volumeSlider = document.getElementById("sbj-volume-slider") as HTMLInputElement;

        //  ストリーミング開始ボタン
        startBotton.onclick = (e) => {
            this.Controller.StartStreaming();
            startBotton.hidden = true;
            stopBotton.hidden = false;
            camchangeBotton.hidden = true;

            //  volumeOff.hidden = false;
            //  sliderDiv.hidden = false;
        }

        //  ストリーミング停止ボタン
        stopBotton.onclick = (e) => {

            this.Controller.StopStreaming();
            //  ページごと閉じてしまう。
            this.PageClose();
        };

        let isSafari = StdUtil.IsSafari();
        let isInit = false;

        //  ミュート状態解除
        volumeOff.onclick = (e) => {
            volumeOn.hidden = false;
            volumeOff.hidden = true;
            this.SetMute(false, isSafari);
        }

        //  ミュートにする
        volumeOn.onclick = (e) => {
            volumeOn.hidden = true;
            volumeOff.hidden = false;
            this.SetMute(true, isSafari);
        }

        //  音量調整
        volumeSlider.oninput = (e) => {
            let volumeStr = volumeSlider.value;

            let isMute = (volumeStr === "0");
            volumeOn.hidden = isMute;
            volumeOff.hidden = !isMute;

            this.SetVolume(volumeStr, isSafari);
        }

        let cam = MobileCam.REAR;

        //  プレビュー表示処理
        let startPreviewFunc = (cam: MobileCam) => {
            setTimeout(() => {
                this.SetStreamPreview(cam, () => {
                    camchangeBotton.disabled = false;
                    startBotton.disabled = false;
                });
            }, 200);
        }

        //  カメラ変更ボタン
        camchangeBotton.onclick = (e) => {
            camchangeBotton.disabled = true;
            startBotton.disabled = true;
            setTimeout(() => {
                this.StopStreamPreview();
                //  リアとフロントのカメラを切替えプレビュー表示
                cam = (cam === MobileCam.REAR ? MobileCam.FRONT : MobileCam.REAR);
                startPreviewFunc(cam);
            }, 200);
        };

        //  スマホ画面の回転時イベント
        let controller = this.Controller;
        document.addEventListener("DOMContentLoaded", () => { this.SendOrientationChange(controller); });
        window.addEventListener('orientationchange', () => { this.SendOrientationChange(controller); }, false);

        //  起動時はリアカメラでプレビュー表示する
        startPreviewFunc(MobileCam.REAR);

        this.InitializeCursor();

        callback();
    }


    /**
     * ページごと閉じる
     */
    public PageClose() {
        window.open('about:blank', '_self').close();
    }


    /**
     * ボリューム設定
     * @param volume 
     * @param isSafari 
     */
    private SetVolume(volumeStr: string, isSafari: boolean) {

        let volume = (Number.parseInt(volumeStr) / 100.0);

        if (!this._isAudioInit && volume > 0) {
            this.InitilizeAudio(isSafari);
            this._isAudioInit = true;
        }

        if (isSafari) {
            this._gainNode.gain.value = volume;
        }
        else {
            (document.getElementById('audio') as HTMLAudioElement).volume = volume;
        }
    }


    /**
     * 
     * @param isMute 
     * @param isSafari 
     */
    private SetMute(isMute: boolean, isSafari: boolean) {
        let slider = document.getElementById("sbj-volume-slider") as HTMLInputElement;
        if (isMute) {
            this._preVolumeValue = slider.value;
            slider.value = "0";
        }
        else {
            slider.value = this._preVolumeValue;
        }
        this.SetVolume(slider.value, isSafari);
    }


    /**
     * 
     * @param isSafari 
     */
    private InitilizeAudio(isSafari: boolean) {
        if (isSafari) {
            this.SetStream_WebAudio();
        }
        else {
            let audioElement = document.getElementById('audio') as HTMLAudioElement;
            this.SetStream_AudioElement(audioElement);
        }
    }

    /**
     * 
     * @param audioElement 
     */
    private SetStream_AudioElement(audioElement: HTMLAudioElement) {
        audioElement.volume = 0;
        audioElement.srcObject = CastInstanceMobileView._mediaStream;
        audioElement.play();
    }


    /**
     * 
     * @param isMute 
     */
    private SetStream_WebAudio() {

        if (CastInstanceMobileView._mediaStream) {
            this._audioContext = new AudioContext();
            this._mediaStreamNode = this._audioContext.createMediaStreamSource(CastInstanceMobileView._mediaStream);
            this._gainNode = this._audioContext.createGain();
            this._mediaStreamNode.connect(this._gainNode);
            this._gainNode.gain.value = 0;
            this._gainNode.connect(this._audioContext.destination);
        }
    }



    public StopStreamPreview() {

        let videoElement = document.getElementById('video-preview') as HTMLVideoElement;
        if (videoElement) videoElement.srcObject = null;

        if (this.Controller.Stream) {
            StreamUtil.Stop(this.Controller.Stream);
        }
    }


    /**
     * Video/Audioソースの取得とリストへのセット
     */
    public SetStreamPreview(cam: MobileCam, callback) {

        let controller = this.Controller;
        let videoElement = document.getElementById('video-preview') as HTMLVideoElement;

        let msc: MediaStreamConstraints;
        let isDebug = false;

        if (isDebug) {
            msc = StreamUtil.GetMediaStreamConstraints_DefaultDevice();
        }
        else {
            msc = StreamUtil.GetMediaStreamConstraints_Mobile(cam, true);
        }

        StreamUtil.GetStreaming(msc,
            (stream) => {
                controller.Stream = stream;

                if (stream && videoElement) {
                    videoElement.onplaying = (e) => { callback(); }
                    StreamUtil.StartPreview(videoElement, stream);
                }
                else {
                    callback();
                }
            },
            (error) => {
                this.StreamErrorClose();
                alert(error);
            }
        );
    }


    /**
     * 他のユーザーからのストリーム接続時イベント
     * @param peerid 
     */
    public SetMediaStream(peerid: string, stream: MediaStream, isAlive: boolean) {
        CastInstanceMobileView._mediaStream = stream;

        let videoRecv = document.getElementById('video-receiver') as HTMLVideoElement;
        videoRecv.srcObject = stream;

        (document.getElementById("sbj-volume-button-on") as HTMLInputElement).disabled = false;
        (document.getElementById("sbj-volume-button-off") as HTMLInputElement).disabled = false;
        (document.getElementById("sbj-volume-slider") as HTMLInputElement).disabled = false;
    }


    /**
     * エラーメッセージを表示します
     * @param message 
     */
    public SetError(message: string) {

        document.getElementById('sbj-cast-instance-main').hidden = true;

        let disconnect = document.getElementById('sbj-cast-instance-disconnect');

        if (disconnect) {
            disconnect.hidden = false;
            let errorEelement = document.getElementById('error-message');
            errorEelement.innerText = message;
        }

    }


    /**
     * ストリームが取得できなかった場合、メッセージ表示して終了する
     */
    public StreamErrorClose() {
        document.getElementById('video-preview').hidden = true;
        document.getElementById('video-receiver').hidden = true;
        document.getElementById('sbj-cast-instance-stream-error').hidden = false;
        this.Controller.SwPeer.Close();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {
        let video = document.getElementById('video-preview') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-cast-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-cast-cursor-port') as HTMLElement;
        this.Cursor = new CursorController(this.Controller, video, itemport, curport);
        this.Cursor.DisplayAll();
    }


    /**
     * ライブキャストの設定変更
     * @param sender
     */
    public SetCastSetting(sender: CastSettingSender) {

        if (this.Cursor) {
            if (sender.dispUserCursor) {
                this.Cursor.ClearQueue();
            }
            else {
                this.Cursor.Clear();
            }
        }
    }

    /**
     * 
     * @param controller 
     */
    public SendOrientationChange(controller: CastInstanceMobileController) {
        controller.SendOrientationChange();
        controller.View.Cursor.Clear();

    }

}
