import { IServiceController } from "./IServiceController";
import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";

export default class WebRTCService {

    private static _peer: PeerJs.Peer;
    private static _owner: PeerJs.DataConnection;
    private static _clients: Array<PeerJs.DataConnection> = new Array<PeerJs.DataConnection>();
    private static _service: IServiceController;
    private static _serviceName: string;
    private static _videoElement: HTMLElement;

    /**
     * WebRTCServiceの起動
     * @param service
     * @param ownerid
     * @param name
     */
    public static Start(service: IServiceController, ownerid: string, serviceName: string, videoElement: HTMLElement = null) {

        this._serviceName = serviceName;
        LogUtil.Info("Start WebRTC : " + serviceName + (ownerid ? "(Owner : " + ownerid + ")" : ""));

        this.GetApiKey((apikey) => {
            this._peer = new Peer({ key: apikey, debug: 1 }, );
            this._service = service;
            WebRTCService._videoElement = videoElement;

            //  終了時処理
            window.onbeforeunload = (e) => {
                WebRTCService.Close();
            };

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
                        LogUtil.Error(errMsg);
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

            LogUtil.Info(this._serviceName + " PeerOpen (" + peer.id + ")");

            service.OnPeerOpen(peer);
            if (ownerConnect)
                ownerConnect();
        });

        peer.on('error', (e) => {
            service.OnPeerError(e);
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

            LogUtil.Info(this._serviceName + " Owner peer open (" + onownerid + ")");
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
    public static OwnerSend(data: Sender) {

        let senddata = JSON.stringify(data);

        if (!this._owner) {
            LogUtil.Warning("Owner peer is not initilized : Lost send message : " + senddata);
        }

        if (this._owner.open) {
            this._owner.send(senddata);

            if (LogUtil.IsOutputSender(data))
                LogUtil.Info("Send[Owner] : " + senddata.toString());
        }
        else {
            LogUtil.Warning("Owner is not open : Lost send message : " + senddata);
        }

    }


    /**
     * 指定クライアントへの送信
     * @param conn
     * @param data
     */
    public static ChildSend(conn: PeerJs.DataConnection, data: Sender) {

        let json = JSON.stringify(data);

        //  開いているクライアントにのみ通知
        if (conn.open) {
            conn.send(json);
            if (LogUtil.IsOutputSender(data))
                LogUtil.Info("Send : " + json.toString());
        }
        else {
            LogUtil.Warning("Client is not open : Lost send message : " + json);
        }
    }


    /**
     * 全接続クライアントへの送信
     * @param data
     */
    public static ChildSendAll(data: Sender) {

        let json = JSON.stringify(data);

        WebRTCService._clients.forEach(client => {

            //  開いているクライアントにのみ通知
            if (client.open) {
                client.send(json);
            }

        });

        if (LogUtil.IsOutputSender(data))
            LogUtil.Info("Send[All] : " + json.toString());
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
            let constraints = {
                video: { optional: [{ sourceId: videoSource }] }
            };

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
     * ストリーミング設定
     * @param isAudio
     * @param audioSource
     * @param isVideo
     * @param videoSource
     */
    public static SetStreaming(isAudio: boolean, audioSource: string, isVideo: boolean, videoSource: string) {

        this.VideoMute();
        this.AudioMute();

        if (isVideo || isAudio) {

            let constraints;

            if (isAudio && isVideo) {
                constraints = {
                    audio: { optional: [{ sourceId: audioSource }] },
                    video: { optional: [{ sourceId: videoSource }] }
                };
            }
            else if (isAudio) {
                constraints = {
                    audio: { optional: [{ sourceId: audioSource }] },
                };
            }
            else if (isVideo) {
                constraints = {
                    video: { optional: [{ sourceId: videoSource }] }
                };
            }

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