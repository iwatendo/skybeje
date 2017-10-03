
import WebRTCService from "../WebRTCService";
import SWConnection from "./SWConnection";
import { IServiceController } from "../IServiceController";
import Sender from "../../Container/Sender";
import LogUtil from "../../Util/LogUtil";
import SWPeer from "./SWPeer";


/**
 * データコネクション管理クラス
 */
export default class SWConnectionCache {

    private _owner: SWConnection;
    private _swpeer: SWPeer;
    private _service: IServiceController;
    private _map = new Map<string, SWConnection>();

    /**
     * コンストラクタ
     * @param service サービスコントローラー
     */
    constructor(swpeer: SWPeer) {
        this._swpeer = swpeer;
        this._service = swpeer.Service;
    }


    /**
     * コネクションキャッシュ
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {
        let pp = this.GetConnection(conn.peer);
        pp.Set(conn);
    }


    /**
     * 
     * @param conn 
     */
    public SetOwner(conn: PeerJs.DataConnection) {
        this._owner = new SWConnection(this._swpeer, conn.peer);
    }


    /**
     * 
     * @param data 
     */
    public SendToOwner(sender: Sender) {
        if (this._owner) {
            let data = JSON.stringify(sender);
            this._owner.Send(data);
            if (LogUtil.IsOutputSender(sender)) {
                LogUtil.Info(this._service, "send(owner) : " + data.toString());
            }
        }
    }


    /**
     * 子の接続先にデータ送信
     */
    public Send(peerid: string, sender: Sender) {
        let data = JSON.stringify(sender);
        let pp = this.GetConnection(peerid);
        pp.Send(data);

        if (LogUtil.IsOutputSender(sender)) {
            LogUtil.Info(this._service, "send : " + data.toString());
        }
    }


    /**
     * 全ての接続クライアントへ通知
     */
    public SendAll(sender: Sender) {
        let data = JSON.stringify(sender);
        this._map.forEach((peerPair, key) => {
            peerPair.Send(data);
        });

        if (LogUtil.IsOutputSender(sender)) {
            LogUtil.Info(this._service, "send(all) : " + data.toString());
        }
    }


    /**
     * 接続クライアントの接続有無確認
     */
    public CheckAlive() {

        if (this._owner) {
            if (!this._owner.IsAlive()) {
                this._service.OnOwnerClose();
            }
        }

        this._map.forEach((peerPair, key) => {
            peerPair.CheckAlive();
        });
    }


    /**
     * 全接続クローズ
     */
    public Close() {
        this._map.forEach((peerPair, key) => {
            if (peerPair.IsAlive()) {
                peerPair.Close();
            }
        });
    }


    /**
     * 有効な接続件数の取得
     */
    public AliveConnectionCount(): number {
        let result: number = 0;

        this._map.forEach((peerPair, key) => {
            if (peerPair.IsAlive()) {
                result++;
            }
        });

        return result;
    }
    

    /**
     * 接続情報を取得
     * @param peerid 
     */
    private GetConnection(peerid: string): SWConnection {

        let map = this._map;

        if (map.has(peerid)) {
            return map.get(peerid);
        }
        else {
            if (this._owner) {
                if (this._owner.peerid === peerid) {
                    return this._owner;
                }
            }

            let pp = new SWConnection(this._swpeer, peerid);
            map.set(peerid, pp);
            return pp;
        }
    }

}
