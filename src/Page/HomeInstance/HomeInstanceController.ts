
import { Room } from "../../Base/IndexedDB/Home";

import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import LocalCache from "../../Base/Common/LocalCache";
import LogUtil from "../../Base/Util/LogUtil";

import * as HIContainer from "./HomeInstanceContainer";
import HomeInstanceReceiver from "./HomeInstanceReceiver";
import HomeInstanceView from "./HomeInstanceView";
import HomeInstanceModel from "./HomeInstanceModel";

import ManagerController from "./Manager/ManagerController";
import { RoomView } from "./Room/RoomView";

/**
 * 
 */
export default class HomeInstanceController extends AbstractServiceController<HomeInstanceView, HomeInstanceModel> {

    public ControllerName(): string { return "HomeInstance"; }

    public PeerID: string;
    public Manager: ManagerController;
    public Room: RoomView;


    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new HomeInstanceReceiver(this);
    };


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  通常は呼ばれない。
        //  多重起動が検出されたケースで呼ばれる為、終了通知を出す。
        this.SwPeer.SendToOwner(new HIContainer.ForcedTerminationSender());

    }


    /**
     *  オーナ切断時イベント
     */
    public OnOwnerClose() {
        //  強制終了側のインスタンスで
        //  以下の値が削除される為再設定する
        LocalCache.BootHomeInstancePeerID = this.PeerID;
    }


    /**
     * 自身のPeer生成時イベント
     * ※サーバー用のPeerID取得時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        //  HomeInstanceIDをLocalCacheに保持
        LocalCache.BootHomeInstancePeerID = peer.id;
        this.PeerID = peer.id;

        //  DB接続
        this.Model = new HomeInstanceModel(this, () => {

            //  タイムラインメッセージの読込
            this.Manager = new ManagerController(this, () => {

                //  UI初期化
                this.View = new HomeInstanceView(this, () => {

                });

            });

        });

    }


    /**
     * Peerエラー
     * @param err
     */
    public OnPeerError(err: Error) {

        LogUtil.Error(this, err.name);
        LogUtil.Error(this, err.message);
    }


    /**
     * 
     */
    public OnPeerClose() {

        //  インスタンスが正常終了した場合、接続情報はクリアする
        if (this.PeerID === LocalCache.BootHomeInstancePeerID) {
            LocalCache.BootHomeInstancePeerID = "";
        }
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
        this.Manager.Room.RemoveConnection(conn.peer);
        this.Manager.Servent.CloseServentOwner(conn.peer);
        this.Manager.VoiceChat.RemoveConnection(conn.peer);
    }



    /**
     * ルーム情報の送信
     * @param conn 
     * @param req 
     */
    public SendRoom(conn: PeerJs.DataConnection, req: HIContainer.GetRoomSender) {

        let sender = new HIContainer.RoomSender();

        this.Model.GetRoom(req.hid, (room) => {
            //  ルーム情報の通知
            sender.room = room;
            this.SwPeer.SendTo(conn, sender);

            //  ルーム内のサーバント情報の通知
            let sssender = this.Manager.Servent.GetServent(req.hid);
            this.SwPeer.SendTo(conn, sssender);

            //  ボイスチャットのメンバー通知
            this.Manager.VoiceChat.SendMemberList();
        });
    }


    /**
     * 部屋情報の変更通知
     * @param room 
     */
    public SendChnageRoom(room: Room) {
        let sender = new HIContainer.RoomSender();
        sender.room = room;
        this.SwPeer.SendAll(sender);
    }

};
