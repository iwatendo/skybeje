/**
 * サービスコントローラー
 */
export interface IServiceController {

    //  自身のPeer生成時イベント
    OnPeerOpen(peer: PeerJs.Peer);

    //  自身のPeer生成時エラー
    OnPeerError(err: Error);

    //  自身の終了時イベント
    OnPeerClose();

    //  オーナーPeerの接続イベント
    OnOwnerConnection();

    //  オーナーPeerのエラー
    OnOwnerError(err: Error);

    //  オーナーPeerの切断時イベント
    OnOwnerClose();

    //  子Peerからの接続時のイベント
    OnChildConnection(conn: PeerJs.DataConnection);

    //  子Peerからのエラー
    OnChildError(err: Error);

    //  子Peerからの接続解除時のイベント
    OnChildClose(conn: PeerJs.DataConnection);

    //  ストリーミング開始時・終了時イベント
    OnStreaming(isSucceed: boolean, isStreaming: boolean);

    //  データ取得時イベント
    Recv(conn: PeerJs.DataConnection, recv);

}
