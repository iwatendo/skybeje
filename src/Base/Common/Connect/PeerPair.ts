import { IServiceController } from "../IServiceController";
import WebRTCService from "../WebRTCService";
import LogUtil from "../../Util/LogUtil";


export default class PeerPair {

    public peerid: string;

    private _service: IServiceController
    private _isStreaming: boolean;
    private _conn: PeerJs.DataConnection;
    private _sendQueue = new Array<any>();
    private _isOpen = false;
    private _isCreate = false;


    /**
     * コンストラクタ
     * @param peerid ピアID
     * @param service サービスコントローラー
     */
    constructor(peerid: string, service: IServiceController) {
        this.peerid = peerid;
        this._service = service;
        this._conn = null;
    }


    /**
     * 
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {

        this._conn = conn;
        conn.on('open', () => { this.OnConnectionOpen(this._conn); });
        conn.on("data", (data) => { this._service.Recv(this._conn, data); });
        conn.on('error', (e) => { this._service.OnChildError(e); });
        conn.on("close", () => { this._service.OnChildClose(this._conn); });
    }


    /**
     * データ送信
     * @param data 
     */
    public Send(data: any) {

        //  接続済みの場合は即送信
        if (this._isOpen) {
            if (this._conn.open) {
                this._conn.send(data);
            }
        }
        else {
            if (!this._isCreate) {
                this._isCreate = true;
                this.Set(WebRTCService._peer.connect(this.peerid));
            }

            this._sendQueue.push(data);
        }
    }


    /**
     * 
     * @param conn 
     */
    private OnConnectionOpen(conn: PeerJs.DataConnection) {
        this._isOpen = true;
        LogUtil.Info(this._service, "data connection [" + WebRTCService.PeerId() + "] <-> [" + conn.peer + "]");
        this._sendQueue.forEach((data) => { conn.send(data); });
        this._sendQueue = new Array<any>();
        this._service.OnChildConnection(conn);
        this.StartStreaming();
    }


    /**
     * 終了処理
     */
    public Close() {
        if (this._conn === null)
            return;

        if (this._conn.open) {
            this._conn.close();
        }
    }


    /**
     * 
     */
    public IsAlive() {
        if (this._conn === null) return false;
        return this._conn.open;
    }


    /**
     * 
     */
    public CheckAlive() {
        if (this._conn) {
            if (this._conn.open) {
                return true;
            }
            else {
                this._service.OnChildClose(this._conn);
                return false;
            }
        }
        else {
            return false;
        }
    }


    /**
     * 
     */
    public StartStreaming() {

        if (!this._isStreaming) {
            if (WebRTCService.StartStreamingPeer(this.peerid)) {
                this._isStreaming = true;
            }
        }
    }

}
