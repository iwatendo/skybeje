import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";
import { IServiceController } from "./IServiceController";
import { IServiceReceiver } from "./IServiceReceiver";
import { IServiceView } from "./IServiceView";
import { IServiceModel } from "./IServiceModel";

/**
 * Peerサービスコントローラーの抽象化クラス
 */
export default abstract class AbstractServiceController<V extends IServiceView, M extends IServiceModel> implements IServiceController {

    private _peer: PeerJs.Peer;

    public View: V;
    public Model: M;
    public Receiver: IServiceReceiver;

    public abstract ControllerName(): string;

    /**
     * 
     */
    constructor() {
    }


    /**
     *  Peer接続されているか？
     */
    public get IsOpen(): boolean {

        if (this._peer) {
            return this._peer.destroyed;
        }
        else {
            return false;
        }
    }


    /**
     * エラーログ出力
     * @param message
     * @param err
     */
    public LogError(message: string, err: Error) {

        let log = '';

        if (err.name && err.name.length > 0)
            log += err.name + ' : ';

        if (message && message.length > 0)
            log += message + '\n';

        if (err.message && err.message.length > 0)
            log += err.message;

        LogUtil.Error(this, log);
    }



    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this._peer = peer;
    }


    /**
     * 自身のPeerエラー時イベント
     * @param err
     */
    public OnPeerError(err: Error) {
        this.LogError('this peer', err);
    }


    /**
     * 自身のPeerClose時イベント
     */
    public OnPeerClose() {
        this._peer = null;
    }


    /**
     * オーナーPeerの接続時イベント
     */
    public OnOwnerConnection() {
    }


    /**
     * オーナーPeerのエラー発生時イベント
     * @param err
     */
    public OnOwnerError(err: any) {
        this.LogError('owner peer', err);
    }


    /**
     * オーナーPeerの切断時イベント
     */
    public OnOwnerClose() {
    }


    /**
     * 子Peerからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
    }


    /**
     * 子Peerのエラー発生時イベント
     * @param err
     */
    public OnChildError(err: Error) {
        this.LogError('child peer', err);
    }


    /**
     * 子Peerの切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
    }


    /**
     * データ取得時イベント
     * @param conn
     * @param recv
     */
    public Recv(conn: PeerJs.DataConnection, recv) {

        if (recv === null)
            return;

        let sender: Sender = JSON.parse(recv) as Sender;

        if (LogUtil.IsOutputSender(sender))
            LogUtil.Info(this, "recv : " + recv);

        if (sender === null)
            return;

        if (sender.type === null)
            return;

        this.Receiver.Receive(conn, sender);
    }

}


