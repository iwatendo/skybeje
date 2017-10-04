import StdUtil from "../../Util/StdUtil";
import LogUtil from "../../Util/LogUtil";
import { IServiceController } from "../IServiceController";
import SWPeer from "./SWPeer";
import SWRoom, { ISWRoom, SWRoomMode } from "./SWRoom";


interface OnGetMediaStream { (stream: MediaStream): void }
declare var SkyWay: any;

export default class SWStream implements ISWRoom {

    public _service: IServiceController;
    public _swPeer: SWPeer;
    public _swRoom: SWRoom;
    public _localStream: MediaStream;
    public _previewStream: MediaStream;
    public _screenShare = null;
    public _existingCallList: Array<PeerJs.MediaConnection>;


    /**
     * コンストラクタ
     * @param service 
     * @param peer 
     */
    constructor(service: IServiceController, peer: SWPeer) {
        this._service = service;
        this._swPeer = peer;
    }


    /**
     * プレビュー設定
     * @param element 
     * @param videoSource 
     */
    public SetPreview(element: HTMLVideoElement, videoSource: string) {
        if (element) {
            this.GetMediaStream(videoSource, "", (stream) => {
                this.StartPreview(element, stream);
            });
        }
    }


    /**
     * プレビュー開始
     * @param element 
     * @param stream メディアストリーム
     */
    public StartPreview(element: HTMLVideoElement, stream: MediaStream) {
        this._previewStream = stream;
        element.src = null;

        if (StdUtil.IsSafari()) {
            element.srcObject = stream;
        }
        else {
            element.src = URL.createObjectURL(stream);
        }
    }


    /**
     * プレビュー停止
     * @param element 
     */
    public StopPreview(element: HTMLVideoElement) {
        if (this._previewStream) {
            if (this._previewStream.getVideoTracks().length > 0) {
                this._previewStream.getVideoTracks()[0].stop();
            }
        }
        element.src = null;
    }


    /**
     * メディア
     * @param videoSource 
     * @param audioSource 
     * @param callback 
     */
    public GetMediaStream(videoSource: string, audioSource: string, callback: OnGetMediaStream) {

        let constraints = this.GetMediaTrackConstraints(videoSource, audioSource);

        navigator.getUserMedia(constraints,
            (stream) => {
                callback(stream);
            }, (err: MediaStreamError) => {
                LogUtil.Error(this._service, err.name);
                LogUtil.Error(this._service, err.message);
            }
        );
    }


    /**
     * 
     * @param videoSource 
     * @param audioSource 
     */
    private GetMediaTrackConstraints(videoSource: string, audioSource: string): MediaStreamConstraints {

        let result: MediaStreamConstraints = {
            video: (videoSource ? { advanced: ([{ deviceId: videoSource }]) } : false),
            audio: (audioSource ? { advanced: ([{ deviceId: audioSource }]) } : false),
        };

        return result;
    }


    /**
     * Skybeje Screen Share Extensionのインストール有無確認
     */
    public IsEnabledExtension(): boolean {
        if (!this._screenShare) {
            this._screenShare = new SkyWay.ScreenShare({ debug: true });
        }
        return this._screenShare.isEnabledExtension();
    }


    /**
     * スクリーンシェアのメディアストリームを取得します。
     * 【注意】Skybejeの Chrome Extension がインストールされている必要があります。
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    public GetScreenShareMediaStream(width: number, height: number, fr: number, callback: OnGetMediaStream) {

        if (!this._screenShare) {
            this._screenShare = new SkyWay.ScreenShare({ debug: true });
        }

        // スクリーンシェアを開始
        if (this._screenShare.isEnabledExtension()) {

            let sWidth = (width === 0 ? "" : width.toString());
            let sHeight = (height === 0 ? "" : height.toString());
            let sFrameRate = (fr === 0 ? "1" : fr.toString());
            let option = {};

            if (width === 0 || height === 0) {
                option = { FrameRate: sFrameRate };
            }
            else {
                option = { Width: sWidth, Height: sHeight, FrameRate: sFrameRate };
            }

            this._screenShare.startScreenShare(option,
                (stream) => {
                    callback(stream);
                }, (err: MediaStreamError) => {
                    LogUtil.Error(this._service, err.name);
                    LogUtil.Error(this._service, err.message);
                }, () => {
                });
        } else {
            this.ClearStreaming();
            alert('スクリーンシェアを開始するためには SkyBeje ScreenShare Extension のインストールが必要です。');
        }
    }


    /**
     * ストリーミング設定
     * @param audioSource
     * @param videoSource
     */
    public SetStreaming(audioSource: string, videoSource: string) {

        if (!StdUtil.IsSafari()) {
            this.VideoMute();
            this.AudioMute();
        }

        if (videoSource || audioSource) {
            this.GetMediaStream(videoSource, audioSource, (stream) => {
                this.StartStreaming(stream);
            });
        }
        else {
            this.ClearStreaming();
        }
    }


    /**
     * スクリーンシェアの開始
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    public SetScreenSheare(width: number, height: number, fr: number, callback) {
        this.GetScreenShareMediaStream(width, height, fr, (stream) => {
            this.StartStreaming(stream);
            callback();
        });
    }


    /**
     * ストリーミングを開始します
     * @param stream 
     */
    private StartStreaming(stream) {

        //  ストリーミング開始 / 設定変更
        this._localStream = stream;

        if (this._swRoom) {
            this._swRoom.Close();
        }

        let mode = SWRoomMode.Default;
        let name = this._swPeer.PeerId;
        this._swRoom = new SWRoom(this, this._swPeer, name, mode, stream);
    }


    /**
     * 
     */
    private ClearStreaming() {
        this._localStream = null;

        if (this._existingCallList) {
            this._existingCallList.forEach(exc => {
                exc.close();
            });
            this._existingCallList = null;
        }
    }


    /**
     * 動画配信のミュート
     */
    public VideoMute() {
        if (this._localStream)
            if (this._localStream.getVideoTracks().length > 0)
                this._localStream.getVideoTracks()[0].stop();
    }


    /**
     *  音声配信のミュート
     */
    public AudioMute() {
        if (this._localStream)
            if (this._localStream.getAudioTracks().length > 0)
                this._localStream.getAudioTracks()[0].stop();
    }


    /**
     * 一時停止 / 再開
     */
    public set Puase(value: boolean) {
        if (this._localStream) {
            if (this._localStream.getVideoTracks().length > 0) {
                this._localStream.getVideoTracks()[0].enabled = !value;
            }
            if (this._localStream.getAudioTracks().length > 0) {
                this._localStream.getAudioTracks()[0].enabled = !value;
            }
        }
    }


    /**
     * 
     */
    public OnRoomOpen() {
    }


    /**
     * 
     * @param err 
     */
    public OnRoomError(err: any) {
        LogUtil.Error(this._service, err.toString());
    }


    /**
     * 
     */
    public OnRoomClose() {
        this._swRoom = null;
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerJoin(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerLeave(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     * @param recv 
     */
    public OnRoomRecv(peerid: string, recv: any) {
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: any) {
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {
    }


}