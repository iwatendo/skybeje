
import WebRTCService from "../WebRTCService";
import PeerPair from "./PeerPair";
import { IServiceController } from "../IServiceController";
import Sender from "../../Container/Sender";
import LogUtil from "../../Util/LogUtil";


/**
 * データコネクション管理クラス
 */
export default class ConnectionCache {

    /**
     * コンストラクタ
     * @param service サービスコントローラー
     */
    constructor(service: IServiceController) {
        this._service = service;
    }


    private _service: IServiceController


    /**
     * 
     */
    private _owner: PeerPair


    /**
     * コネクションMAP
     */
    private _map = new Map<string, PeerPair>();


    /**
     * コネクションキャッシュ
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {
        let pp = this.GetPeerPair(conn.peer);
        pp.Set(conn);
    }


    /**
     * 
     * @param conn 
     */
    public SetOwner(conn: PeerJs.DataConnection) {
        this._owner = new PeerPair(conn.peer, this._service);
    }


    /**
     * 
     * @param data 
     */
    public SendToOwner(sender: Sender) {

        let data = JSON.stringify(sender);
        this._owner.Send(data);

        if (LogUtil.IsOutputSender(sender)) {
            LogUtil.Info(this._service, "send(owner) : " + data.toString());
        }
    }


    /**
     * 子の接続先にデータ送信
     */
    public Send(peerid: string, sender: Sender) {
        let data = JSON.stringify(sender);
        let pp = this.GetPeerPair(peerid);
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
     * 
     */
    public StartStreaming() {
        this._map.forEach((peerPair, key) => {
            peerPair.StartStreaming();
        });
    }


    /**
     * 全接続クローズ
     */
    public Close() {
        this._map.forEach((peerPair, key) => {
            peerPair.Close();
        });
    }


    /**
     * 有効な接続件数の取得
     */
    public AliveConnectionCount(): number {
        let result: number = 0;

        this._map.forEach((peerPair, key) => {
            if (peerPair.IsAlive()) {
                LogUtil.Info(null, "Count : " + peerPair.peerid);
                result++;
            }
        });

        return result;
    }


    /**
     * ピアペアを取得します
     * @param peerid 
     */
    private GetPeerPair(peerid: string): PeerPair {

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

            let pp = new PeerPair(peerid, this._service);
            map.set(peerid, pp);
            return pp;
        }
    }

}
