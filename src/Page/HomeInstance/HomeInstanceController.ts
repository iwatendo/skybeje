﻿
import { Room } from "../../Contents/IndexedDB/Home";

import AbstractServiceController from "../../Base/AbstractServiceController";
import LogUtil from "../../Base/Util/LogUtil";

import HomeInstanceReceiver from "./HomeInstanceReceiver";
import HomeInstanceView from "./HomeInstanceView";
import HomeInstanceModel from "./HomeInstanceModel";

import ManagerController from "./Manager/ManagerController";
import { RoomView } from "./Room/RoomView";
import LocalCache from "../../Contents/Cache/LocalCache";
import ForcedTerminationSender from "../../Contents/Sender/ForcedTerminationSender";
import GetRoomSender from "../../Contents/Sender/GetRoomSender";
import RoomSender from "../../Contents/Sender/RoomSender";

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
     * インスタンス起動情報のクリア処理
     */
    public ClearBootInfo() {
        //  インスタンスが正常終了した場合、接続情報はクリアする
        if (this.PeerID === LocalCache.BootHomeInstancePeerID) {
            LocalCache.BootHomeInstancePeerID = "";
        }
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
        super.OnPeerError(err);
        //  子のピアが予期せぬ切断をしてもアラート表示はしない
        //  alert(err.name + "\n" + err.message);
    }


    /**
     * 
     */
    public OnBeforeUnload() {
        this.ClearBootInfo();
    }


    /**
     * 
     */
    public OnPeerClose() {
        this.ClearBootInfo();
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
        super.OnDataConnectionOpen(conn);
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
        super.OnDataConnectionClose(conn);
        this.Manager.Chat.RemoveConnection(conn.remoteId);
        this.Manager.Room.RemoveConnection(conn.remoteId);
        this.Manager.Servent.CloseServentOwner(conn.remoteId);
        this.Manager.VoiceChat.RemoveConnection(conn.remoteId);
        conn.close();
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
    }


    /**
     * ルーム情報の送信
     * @param conn 
     * @param req 
     */
    public SendRoom(conn: PeerJs.DataConnection, req: GetRoomSender) {

        let sender = new RoomSender();

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
        let sender = new RoomSender();
        sender.room = room;
        this.SwPeer.SendAll(sender);
    }

};
