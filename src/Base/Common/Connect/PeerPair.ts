import { IServiceController } from "../IServiceController";
import WebRTCService from "../WebRTCService";
import LogUtil from "../../Util/LogUtil";


export default class PeerPair {

    public peerid: string;

    private _service: IServiceController
    private _isStreaming: boolean;
    private _inPeer: PeerJs.DataConnection;
    private _outPeer: PeerJs.DataConnection;
    private _sendQueue = new Array<any>();
    private _isCreate = false;
    private _isError = false;


    /**
     * コンストラクタ
     * @param peerid ピアID
     * @param service サービスコントローラー
     */
    constructor(peerid: string, service: IServiceController) {
        this.peerid = peerid;
        this._service = service;
        this._inPeer = null;
        this._outPeer = null;
    }


    /**
     * 
     * @param service 
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {

        this._inPeer = conn;
        this.StartStreaming();

        //
        conn.on('error', (e) => { this._service.OnChildError(e); });
        conn.on("close", () => { this._service.OnChildClose(conn); });
        conn.on("data", (data) => { this._service.Recv(conn, data); });

        LogUtil.Info(this._service, "data connection(recv) [" + conn.peer + "] -> [" + WebRTCService.PeerId() + "]");
        //  イベント通知
        this._service.OnChildConnection(conn);
    }


    /**
     * データ送信
     * @param data 
     */
    public Send(data: any) {

        //  接続済みの場合は即送信
        if (this._outPeer && this._outPeer.open) {

            this._outPeer.send(data);
            
        }
        else {
            if (!this._isCreate) {
                this._isCreate = true;
                this._outPeer = this.CreateOutPeer();
            }

            if (!this._isError) {
                this._sendQueue.push(data);
            }
        }
    }


    /**
     * 
     * @param service 
     * @param conn 
     */
    public CreateOutPeer(): PeerJs.DataConnection {

        let conn = WebRTCService._peer.connect(this.peerid);
        this.StartStreaming();

        conn.on('open', () => {
            this._sendQueue.forEach((data) => { conn.send(data); });
            this._sendQueue = new Array<any>();
            //  this._service.OnChildConnection(conn);
            LogUtil.Info(this._service, "data connection(send) [" + WebRTCService.PeerId() + "] -> [" + conn.peer + "]");
        });

        conn.on('error', (e) => {
            this._isError = true;
            this._service.OnChildError(e);
        });

        conn.on("close", () => {
            this._service.OnChildClose(conn);
        });

        conn.on("data", (data) => {
            this._service.Recv(conn, data);
        });

        return conn;
    }


    /**
     * 終了処理
     */
    public Close() {
        this.PeerClose(this._inPeer);
        this.PeerClose(this._outPeer);
    }


    /**
     * 
     */
    public IsAlive() {
        if (this.PeerIsAlive(this._inPeer)) return true;
        if (this.PeerIsAlive(this._outPeer)) return true;
        return false;
    }


    /**
     * 
     */
    public CheckAlive() {
        if (this._outPeer) {
            if (this._outPeer.open) {
                return true;
            }
            else {
                this._service.OnChildClose(this._outPeer);
                return false;
            }
        }
        else {
            return false;
        }
    }


    /**
     * 
     * @param conn 
     */
    private PeerClose(conn: PeerJs.DataConnection) {
        if (this.PeerIsAlive(conn))
            conn.close();
    }


    /**
     * 
     * @param conn 
     */
    private PeerIsAlive(conn: PeerJs.DataConnection): boolean {
        return (conn && conn.open);
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
