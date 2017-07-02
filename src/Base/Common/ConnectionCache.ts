
import WebRTCService from "../../Base/Common/WebRTCService";


interface PeerFunc { (conn: PeerJs.DataConnection): void }


export default class ConnectionCache {

    /**
     * コネクションMAP
     */
    private _map = new Map<string, PeerJs.DataConnection>();

    /**
     * 接続後の処理キュー
     */
    private _queue = new Map<string, Array<PeerFunc>>();


    /**
     * コネクションキャッシュ
     * @param conn 
     */
    public Set(conn: PeerJs.DataConnection) {

        this._map.set(conn.peer, conn);

        if (this._queue.has(conn.peer)) {

            let queues = this._queue.get(conn.peer);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(conn);
            }
        }

    }


    /**
     * 接続要求で失敗したPeerの設定
     * ※Nullを設定し、再度接続要求しないようにする
     * @param peerid 
     */
    public SetErrorPeer(peerid: string) {
        this._map.set(peerid, null);
    }


    /**
     * コネクションの取得と処理実行
     */
    public GetExec(peerid: string, func: PeerFunc) {

        //  接続済み・キャッシュ済みの場合は即実行
        if (this._map.has(peerid)) {
            let conn = this._map.get(peerid);
            if (conn) {
                func(conn);
            }
        }
        else {
            //  未接続の場合は処理をキュー貯め
            //  接続完了後に処理を実行する
            if (this._queue.has(peerid)) {
                this._queue.get(peerid).push(func);
            }
            else {
                let fa = new Array<PeerFunc>();
                fa.push(func);
                this._queue.set(peerid, fa);
            }
            return WebRTCService.OtherConnect(peerid);
        }
    }

}
