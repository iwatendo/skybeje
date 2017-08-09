import { IServiceController } from "./IServiceController";
import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";

export default class WebRTCService {

    private static _peer: PeerJs.Peer;
    private static _owner: PeerJs.DataConnection;
    private static _clients: Array<PeerJs.DataConnection> = new Array<PeerJs.DataConnection>();
    private static _service: IServiceController;
    private static _serviceName: string;
    private static _videoElement: HTMLElement;


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

        Sender.Uid = LocalCache.UserID;

        LogUtil.Info(service, "Start WebRTC " + (ownerid ? "(owner " + ownerid + ")" : ""));

        this.GetApiKey((apikey) => {
            this._peer = new Peer({ key: apikey, debug: 1 }, );
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


            if (ownerid != null && ownerid.length > 0) {
                this._owner = this._peer.connect(ownerid);
            }

            this.PeerSetting(service, this._peer, () => {

                if (this._owner) {
                    this.OwnerPeerSetting(service, this._owner, ownerid);
                }
            });
        });

    }

    /**
     * 
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
        let result: number = 0;

        if (this._clients) {
            this._clients.forEach((client) => {
                if (client.open) {
                    result += 1;
                }
            });
        }

        return result;
    }


    /**
     * 追加接続
     * @param peerid 
     */
    public static OtherConnect(peerid: string): PeerJs.DataConnection {
        let conn = this._peer.connect(peerid);
        this.ChildPeerSetting(this._service, conn);
        return conn;
    }


    /**
     * 自身のPeer設定
     * @param service 自身のサービスコントローラー
     * @param peer 自身のPeer接続
     */
    private static PeerSetting(service: IServiceController, peer: PeerJs.Peer, ownerConnect) {

        peer.on('open', () => {

            LogUtil.Info(service, "peer opened");

            service.OnPeerOpen(peer);
            if (ownerConnect)
                ownerConnect();
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

                call.on('stream', (stream) => {
                    video.onplay = (e) => {
                        service.OnStreamingPlay();
                    }
                    video.setAttribute('src', URL.createObjectURL(stream));
                });
                this.existingCall = call;
            }
        });

        peer.on('connection', (conn) => {
            this.ChildPeerSetting(service, conn);
        });

    }


    /**
     * 呼出元の接続設定
     * @param service 自身のサービスコントローラー
     * @param owner 呼出元の接続情報
     */
    private static OwnerPeerSetting(service: IServiceController, owner: PeerJs.DataConnection, onownerid: string, ) {

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
     * 自身に接続されている子Peerの設定
     * @param service 自身のサービスコントローラー
     * @param child 子のPeerID
     */
    private static ChildPeerSetting(service: IServiceController, conn: PeerJs.DataConnection) {

        //
        conn.on("open", () => {

            //  クライアントリストに追加
            WebRTCService._clients.push(conn);

            //  ストリーミングしている場合は動画を送る
            if (WebRTCService._localStream) {

                if (WebRTCService._existingCallList == null)
                    WebRTCService._existingCallList = new Array<PeerJs.MediaConnection>();

                WebRTCService._existingCallList.push(WebRTCService._peer.call(conn.peer, WebRTCService._localStream));
            }

            //  イベント通知
            service.OnChildConnection(conn);

        });

        //
        conn.on('error', (e) => {
            service.OnChildError(e);
        });

        //
        conn.on("close", () => {
            service.OnChildClose(conn);
        });

        //
        conn.on("data", (data) => {
            service.Recv(conn, data);
        });

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

        if (this._owner) {
            if (!this._owner.open) {
                this._service.OnOwnerClose();
            }
        }

        this._clients.forEach((cl) => {
            if (!cl.open) {
                this._service.OnChildClose(cl);
            }
        });
    }


    /**
     *  WebRTCServiceの停止
     *  全てクライアントとの接続を切断します
     */
    public static Close() {
        this._clients.forEach((client) => {
            client.close();
        });
        this._peer.destroy();
    }


    public static get peerid(): string {
        return this._peer.id;
    }


    /**
     * オーナーへの送信
     * @param data
     */
    public static SendToOwner(data: Sender) {

        let senddata = JSON.stringify(data);

        if (!this._owner) {
            LogUtil.Warning(this._service, "Owner not found : lost send : " + senddata);
            WebRTCService.CheckPeer();
        }

        if (this._owner.open) {
            this._owner.send(senddata);

            if (LogUtil.IsOutputSender(data))
                LogUtil.Info(this._service, "send(Owner) : " + senddata.toString());
        }
        else {
            LogUtil.Warning(this._service, "Owner not open : lost send : " + senddata);
            WebRTCService.CheckPeer();
        }

    }


    /**
     * 指定クライアントへの送信
     * @param conn
     * @param data
     */
    public static SendTo(conn: PeerJs.DataConnection, data: Sender) {

        let json = JSON.stringify(data);

        //  開いているクライアントにのみ通知
        if (conn.open) {
            conn.send(json);
            if (LogUtil.IsOutputSender(data))
                LogUtil.Info(this._service, "send : " + json.toString());
        }
        else {
            LogUtil.Warning(this._service, "Client not open : lost send : " + json);
            WebRTCService.CheckPeer();
        }
    }


    /**
     * 全接続クライアントへの送信
     * @param data
     */
    public static SendAll(data: Sender) {

        let json = JSON.stringify(data);

        WebRTCService._clients.forEach(client => {

            //  開いているクライアントにのみ通知
            if (client.open) {
                client.send(json);
            }

        });

        if (LogUtil.IsOutputSender(data))
            LogUtil.Info(this._service, "send(All) : " + json.toString());
    }


    private static _localStream: MediaStream;
    private static _previewStream: MediaStream;
    private static _existingCallList: Array<PeerJs.MediaConnection>;


    /**
     * プレビュー設定
     * @param videoSource
     * @param isPreView
     * @param preview
     */
    public static SetPreview(videoSource: string, isPreView: boolean = false, element: HTMLElement) {

        if (isPreView) {
            let constraints = this.GetMediaTrackConstraints(videoSource, "");

            navigator.getUserMedia(constraints,
                (stream) => {
                    //  プレビュー表示
                    this._previewStream = stream;
                    element.removeAttribute("src");
                    element.setAttribute("src", URL.createObjectURL(stream));
                }, () => {
                }
            );
        }
        else {

            this.StopPreview();
            element.setAttribute("src", "");
            return;
        }

    }


    /**
     * 
     * @param videoSource 
     * @param audioSource 
     */
    public static GetMediaTrackConstraints(videoSource: string, audioSource: string): MediaStreamConstraints {

        let result: MediaStreamConstraints = {
            video: (videoSource ? { advanced: ([{ deviceId: videoSource }]) } : false),
            audio: (audioSource ? { advanced: ([{ deviceId: audioSource }]) } : false),
        };

        return result;
    }


    /**
     * ストリーミング設定
     * @param audioSource
     * @param videoSource
     */
    public static SetStreaming(audioSource: string, videoSource: string) {

        this.VideoMute();
        this.AudioMute();

        if (videoSource || audioSource) {

            let constraints = this.GetMediaTrackConstraints(videoSource, audioSource);

            navigator.getUserMedia(constraints,
                (stream) => {

                    //  ストリーミング開始 / 設定変更
                    this._localStream = stream;

                    //  接続済みのクライアントに動画配信開始
                    this._clients.forEach(conn => {

                        if (this._existingCallList == null)
                            this._existingCallList = new Array<PeerJs.MediaConnection>();

                        this._existingCallList.push(this._peer.call(conn.peer, this._localStream));
                    });

                    //
                    this._service.OnStreaming(true, true);

                }, () => {

                    //
                    this._service.OnStreaming(false, false);

                }
            );
        }
        else {
            this._localStream = null;

            if (this._existingCallList) {
                this._existingCallList.forEach(exc => {
                    exc.close();
                });
                this._existingCallList = null;
            }
        }

    }


    /**
     * 動画PreViewの停止
     */
    public static StopPreview() {
        if (this._previewStream)
            if (this._previewStream.getVideoTracks().length > 0)
                this._previewStream.getVideoTracks()[0].stop();
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