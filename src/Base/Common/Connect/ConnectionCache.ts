
import WebRTCService from "../WebRTCService";
import PeerPair from "./PeerPair";
import { IServiceController } from "../IServiceController";
import Sender from "../../Container/Sender";


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
    public SendToOwner(data: Sender) {
        this._owner.Send(JSON.stringify(data));
    }


    /**
     * 子の接続先にデータ送信
     */
    public Send(peerid: string, data: Sender) {
        let pp = this.GetPeerPair(peerid);
        pp.Send(JSON.stringify(data));
    }


    /**
     * 全ての接続クライアントへ通知
     */
    public SendAll(data: Sender) {
        let json = JSON.stringify(data);
        this._map.forEach((peerPair, key) => {
            peerPair.Send(json);
        });
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
            if (peerPair.IsAlive())
                result++;
        });

        return result;
    }


    /**
     * ピアペアを取得します
     * @param peerid 
     */
    private GetPeerPair(peerid: string) {

        let map = this._map;

        if (map.has(peerid)) {
            return map.get(peerid);
        }
        else {
            let pp = new PeerPair(peerid, this._service);
            map.set(peerid, pp);
            return pp;
        }
    }

}
