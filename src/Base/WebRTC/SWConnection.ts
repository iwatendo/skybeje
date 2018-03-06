import IServiceController from "../IServiceController";
import LogUtil from "../Util/LogUtil";
import SWPeer from "./SWPeer";


export default class SWConnection {

    public peerid: string;

    private _swpeer: SWPeer
    private _service: IServiceController;
    private _conn: PeerJs.DataConnection;
    private _sendQueue = new Array<any>();
    private _isOpen = false;
    private _isCreate = false;


    /**
     * 
     * @param service 
     * @param swpeer 
     * @param peerid 
     */
    constructor(swpeer: SWPeer, peerid: string) {
        this.peerid = peerid;
        this._swpeer = swpeer;
        this._service = swpeer.Service;
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
                this._conn.send(encodeURIComponent(data));
            }
        }
        else {
            if (!this._isCreate) {
                this._isCreate = true;
                this.Set(this._swpeer.Peer.connect(this.peerid));
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
        LogUtil.Info(this._service, "data connection [" + this._swpeer.PeerId + "] <-> [" + conn.remoteId + "]");
        this._sendQueue.forEach((data) => { conn.send(encodeURIComponent(data)); });
        this._sendQueue = new Array<any>();
        this._service.OnChildConnection(conn);
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

}
