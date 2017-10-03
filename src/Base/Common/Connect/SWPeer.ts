import Sender from "../../Container/Sender";
import LogUtil from "../../Util/LogUtil";
import SWConnectionCache from "./SWConnectionCache";
import { IServiceController } from "../IServiceController";
import SWStream from "./SWStream";


interface OnSWPeerOpen { (swPeer: SWPeer): void }

export default class SWPeer {

    private _peer: any;
    private _swStream: SWStream;
    private _owner: PeerJs.DataConnection;
    private _connCache: SWConnectionCache;
    private _service: IServiceController;
    private _opencb: OnSWPeerOpen


    public get Peer(): any {
        return this._peer;
    }

    /**
     * 
     */
    public get PeerId(): string {
        return (this._peer ? this._peer.id : "");
    }


    /**
     * 
     */
    public get Service(): IServiceController {
        return this._service;
    }


    /**
     * 
     */
    public set SWStream(stream: SWStream) {
        this._swStream = stream;
    }


    /**
     * 
     */
    public get SWStream(): SWStream {
        return this._swStream;
    }


    /**
     * コンストラクタ
     * @param service 
     * @param ownerId 
     */
    constructor(service: IServiceController, ownerId: string, opencb: OnSWPeerOpen) {

        //  ストリーミング用設定
        navigator.getUserMedia = navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;

        //
        this._service = service;
        this._connCache = new SWConnectionCache(this);
        this._opencb = opencb;

        //
        window.onoffline = (e) => { this.CheckPeer(); };
        window.document.addEventListener("visibilitychange", () => { this.CheckPeer(); });

        SWPeer.GetApiKey((apikey) => {
            let peer = new Peer({ key: apikey, debug: 1 });

            window.onunload = window.onbeforeunload = () => {
                if (!!peer && !peer.destroyed) {
                    peer.destroy();
                }
            };

            //  
            this.PeerSetting(service, peer, ownerId);

            //
            this._peer = peer;
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
     * 自身のPeer設定
     * @param service 自身のサービスコントローラー
     * @param peer 自身のPeer接続
     */
    private PeerSetting(service: IServiceController, peer: PeerJs.Peer, ownerid: string) {

        peer.on('open', () => {

            LogUtil.Info(service, "peer opened");
            service.OnPeerOpen(peer);

            if (ownerid != null && ownerid.length > 0) {
                let owner = this._peer.connect(ownerid, { reliable: true });
                this._connCache.SetOwner(owner);
                this.OwnerPeerSetting(service, owner, ownerid);
            }

            if (this._opencb) {
                this._opencb(this);
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

        peer.on('call', (call) => {
            //  
        });

    }


    /**
     * 呼出元の接続設定
     * @param service 自身のサービスコントローラー
     * @param owner 呼出元の接続情報
     */
    private OwnerPeerSetting(service: IServiceController, owner: PeerJs.DataConnection, onownerid: string) {

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
     * 
     */
    public CheckPeer() {
        if (this._service) {
            this._connCache.CheckAlive();
        }
    }


    /**
     *  WebRTCServiceの停止
     *  全てクライアントとの接続を切断します
     */
    public Close() {
        this._connCache.Close();
        this._peer.destroy();
    }


    /**
     * オーナーへの送信
     * @param data
     */
    public SendToOwner(data: Sender) {
        this._connCache.SendToOwner(data);
    }


    /**
     * 指定クライアントへの送信
     * @param peer
     * @param data
     */
    public SendTo(peer: string | PeerJs.DataConnection, data: Sender) {

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
    public SendAll(data: Sender) {
        this._connCache.SendAll(data);
    }


    /**
     * 有効なPeer接続件数の取得
     */
    public GetAliveConnectionCount(): number {
        return this._connCache.AliveConnectionCount();
    }

}
