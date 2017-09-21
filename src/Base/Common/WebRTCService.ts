import { IServiceController } from "./IServiceController";
import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";
import ConnectionCache from "./Connect/ConnectionCache";
import StdUtil from "../Util/StdUtil";


interface OnGetMediaStream { (stream: MediaStream): void }

declare var SkyWay: any;

export default class WebRTCService {

    public static _peer: PeerJs.Peer;
    private static _service: IServiceController;
    private static _serviceName: string;
    private static _videoElement: HTMLElement;
    private static _connCache: ConnectionCache;


    /**
     * 
     */
    public static PeerId(): string {
        return (this._peer ? this._peer.id : "");
    }


    /**
     * WebRTCServiceの起動
     * @param service
     * @param ownerid
     * @param name
     */
    public static Start(service: IServiceController, ownerid: string, serviceName: string, videoElement: HTMLElement = null) {

        this._serviceName = serviceName;
        this._connCache = new ConnectionCache(service);

        Sender.Uid = LocalCache.UserID;

        LogUtil.Info(service, "Start WebRTC " + (ownerid ? "(owner " + ownerid + ")" : ""));

        this.GetApiKey((apikey) => {
            this._peer = new Peer({ key: apikey, debug: 1 });
            this._service = service;
            WebRTCService._videoElement = videoElement;

            //  終了時処理
            window.onbeforeunload = (e) => {
                WebRTCService.Close();
            };

            //  オフラインになった場合
            window.onoffline = (e) => { this.CheckPeer(); };

            //  表示切替時（ノートPCの開閉等でも発動します）
            window.document.addEventListener("visibilitychange", () => { this.CheckPeer(); });

            //  ストリーミング用設定
            navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;

            this.PeerSetting(service, this._peer, ownerid);
        });

    }


    /**
     * SkyWayのAPIキーが記述されたファイルを読み込みます
     */
    public static GetApiKey(callback) {

        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    try {
                        let skyway = JSON.parse(xmlhttp.responseText);
                        callback(skyway.apikey);
                        return;
                    }
                    catch (e) {
                        let errMsg = "skyway.json\n" + e.toString();
                        LogUtil.Error(this._service, errMsg);
                        alert(errMsg);
                    }
                }
                else {
                    alert("skyway.json not found.");
                }
            }
        }
        xmlhttp.open("GET", "/skyway.json", true);
        xmlhttp.send();
    }


    /**
     * 有効なPeer接続件数の取得
     */
    public static GetAliveConnectionCount(): number {
        return this._connCache.AliveConnectionCount();
    }


    /**
     * 自身のPeer設定
     * @param service 自身のサービスコントローラー
     * @param peer 自身のPeer接続
     */
    private static PeerSetting(service: IServiceController, peer: PeerJs.Peer, ownerid: string) {

        peer.on('open', () => {

            LogUtil.Info(service, "peer opened");
            service.OnPeerOpen(peer);

            if (ownerid != null && ownerid.length > 0) {
                let owner = this._peer.connect(ownerid, { reliable: true });
                this._connCache.SetOwner(owner);
                this.OwnerPeerSetting(service, owner, ownerid);
            }
        });

        peer.on('connection', (conn) => {
            this._connCache.Set(conn);
        });

        peer.on('error', (e) => {
            service.OnPeerError(e);
            this.CheckPeer();
        });

        peer.on('close', () => {
            service.OnPeerClose();
        });

        peer.on('call', function (call) {

            let video = WebRTCService._videoElement;
            if (video) {
                call.answer();
                if (this.existingCall) {
                    this.existingCall.close();
                }

                call.on('error', (e) => {
                    service.OnStreamingError(e);
                });

                call.on('close', () => {
                    service.OnStreamingClose();
                })

                call.on('stream', (stream) => {
                    video.onplay = (e) => {
                        service.OnStreamingPlay();
                    }
                    video.setAttribute('src', URL.createObjectURL(stream));
                });
                this.existingCall = call;
            }
        });

    }


    /**
     * 呼出元の接続設定
     * @param service 自身のサービスコントローラー
     * @param owner 呼出元の接続情報
     */
    private static OwnerPeerSetting(service: IServiceController, owner: PeerJs.DataConnection, onownerid: string) {

        owner.on("open", () => {
            LogUtil.Info(service, "peer connected to [" + onownerid + "]");
            service.OnOwnerConnection();
        });

        owner.on("error", (e) => {
            service.OnOwnerError(e);
        });

        owner.on("close", () => {
            service.OnOwnerClose();
        });

        owner.on("data", (data) => {
            if (owner.peerConnection)
                service.Recv(owner.peerConnection, data);
        });

        return owner;
    }


    /**
     * ピア接続の存続チェック
     * なんらかの要因でピアのCloseイベントが発動せず切断された場合に、Close処理を実行
     * 
     * ※ネットワークの切断や、
     * 　ノートPCの開閉時に上記のような現象が発生するケースがある様子
     */
    public static CheckPeer() {

        if (!this._service) {
            return;
        }

        this._connCache.CheckAlive();
    }


    /**
     *  WebRTCServiceの停止
     *  全てクライアントとの接続を切断します
     */
    public static Close() {
        this._connCache.Close();
        this._peer.destroy();
    }


    /**
     * オーナーへの送信
     * @param data
     */
    public static SendToOwner(data: Sender) {
        this._connCache.SendToOwner(data);
    }


    /**
     * 指定クライアントへの送信
     * @param peer
     * @param data
     */
    public static SendTo(peer: string | PeerJs.DataConnection, data: Sender) {

        let peerid = "";
        let dc = peer as PeerJs.DataConnection;
        if (dc) { peerid = dc.peer; }
        if (!peerid) { peerid = peer.toString(); }

        this._connCache.Send(peerid, data);
    }


    /**
     * 全接続クライアントへの送信
     * @param data
     */
    public static SendAll(data: Sender) {
        this._connCache.SendAll(data);
    }


    public static _localStream: MediaStream;
    public static _previewStream: MediaStream;
    public static _screenShare = null;
    public static _existingCallList: Array<PeerJs.MediaConnection>;


    /**
     * プレビュー設定
     * @param element 
     * @param videoSource 
     */
    public static SetPreview(element: HTMLVideoElement, videoSource: string) {
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
    public static StartPreview(element: HTMLVideoElement, stream: MediaStream) {
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
    public static StopPreview(element: HTMLVideoElement) {
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
    public static GetMediaStream(videoSource: string, audioSource: string, callback: OnGetMediaStream) {

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
    private static GetMediaTrackConstraints(videoSource: string, audioSource: string): MediaStreamConstraints {

        let result: MediaStreamConstraints = {
            video: (videoSource ? { advanced: ([{ deviceId: videoSource }]) } : false),
            audio: (audioSource ? { advanced: ([{ deviceId: audioSource }]) } : false),
        };

        return result;
    }


    /**
     * Skybeje Screen Share Extensionのインストール有無確認
     */
    public static IsEnabledExtension(): boolean {
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
    public static GetScreenShareMediaStream(width: number, height: number, fr: number, callback: OnGetMediaStream) {

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
    public static SetStreaming(audioSource: string, videoSource: string) {

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
    public static SetScreenSheare(width: number, height: number, fr: number, callback) {
        this.GetScreenShareMediaStream(width, height, fr, (stream) => {
            this.StartStreaming(stream);
            callback();
        });
    }


    /**
     * ストリーミングを開始します
     * @param stream 
     */
    private static StartStreaming(stream) {

        //  ストリーミング開始 / 設定変更
        this._localStream = stream;

        //
        this._connCache.StartStreaming();

        //
        this._service.OnStartStreaming();
    }


    /**
     * 指定されたPeerIDへストリーミングを開始します
     * @param peerid 
     */
    public static StartStreamingPeer(peerid: string): boolean {

        if (this._localStream) {
            if (this._existingCallList == null)
                this._existingCallList = new Array<PeerJs.MediaConnection>();

            this._existingCallList.push(this._peer.call(peerid, this._localStream));
            return true;
        }
        else {
            return false;
        }
    }


    /**
     * 
     */
    private static ClearStreaming() {
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
    public static VideoMute() {
        if (this._localStream)
            if (this._localStream.getVideoTracks().length > 0)
                this._localStream.getVideoTracks()[0].stop();
    }


    /**
     *  音声配信のミュート
     */
    public static AudioMute() {
        if (this._localStream)
            if (this._localStream.getAudioTracks().length > 0)
                this._localStream.getAudioTracks()[0].stop();
    }


    /**
     * 一時停止 / 再開
     */
    public static set Puase(value: boolean) {
        if (this._localStream) {
            if (this._localStream.getVideoTracks().length > 0) {
                this._localStream.getVideoTracks()[0].enabled = !value;
            }
            if (this._localStream.getAudioTracks().length > 0) {
                this._localStream.getAudioTracks()[0].enabled = !value;
            }
        }
    }

}