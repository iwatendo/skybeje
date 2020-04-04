
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";

import CastInstanceMobileModel from "./CastInstanceMobileModel";
import CastInstanceMobileView from "./CastInstanceMobileView";
import { CastInstanceMobileReceiver } from "./CastInstanceMobileReceiver";
import StreamUtil from "../../Base/Util/StreamUtil";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";
import TerminalInfoSender from "../../Contents/Sender/TerminalInfoSender";
import ConnCountSender from "../../Contents/Sender/ConnCountSender";
import CursorClearSender from "../../Contents/Sender/CursorClearSender";

export default class CastInstanceMobileController extends AbstractServiceController<CastInstanceMobileView, CastInstanceMobileModel> {

    public ControllerName(): string { return "CastInstanceMobile"; }

    public View: CastInstanceMobileView;

    public CastStatus = new CastStatusSender(CastTypeEnum.LiveCast);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;
    public Stream: MediaStream;

    private _roomPeerMap = new Map<string, string>();

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceMobileReceiver(this);
        this.CursorCache = new CursorCache();
    };


    private _peerid: string = null;


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this._peerid = peer.id;
        this.View = new CastInstanceMobileView(this, () => { });
    }

    /**
     * 切断時処理
     */
    public OnPeerClose() {
        if (this.IsOpen) {
            this.ServerSend(false, true);
        }
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {
        this.CastStatus = new CastStatusSender(CastTypeEnum.LiveCast);
        this.CastStatus.instanceUrl = location.href;
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid) + "&sfu=" + (this.CastSetting.isSFU ? 1 : 0);
        this.SwPeer.SendToOwner(this.CastStatus);
        this.SendTerminalInfo();
    }


    /**
     * オーナー側が切断した場合
     */
    public OnOwnerClose() {
        //  全てのクライアントとの接続を終了します
        this.SwPeer.CloseAll();
        this.PageClose();
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
        super.OnDataConnectionOpen(conn);

        //  配置済みカーソルの通知
        this.CursorCache.forEach((cursor) => {
            this.SwPeer.SendTo(conn, cursor);
        });

        //  配信設定の通知
        this.SwPeer.SendTo(conn, this.CastSetting);
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
        super.OnDataConnectionClose(conn);
        let cursor = this.CursorCache.Get(conn.remoteId);
        if (cursor) {
            //  切断が発生した場合、全クライアントでカーソルが消えた事を通知
            cursor.isDisp = false;
            this.SwPeer.SendAll(cursor);
        }
        this.CursorCache.Remove(conn.remoteId);
        this.View.Cursor.Remove(conn.remoteId);
    }


    /**
     * 
     */
    public OnRoomPeerJoin(peerid: string) {
        this._roomPeerMap.set(peerid, peerid);
        this.SendPeerCount(this._roomPeerMap.size);
    }


    /**
     * 
     */
    public OnRoomPeerLeave(peerid: string) {
        this._roomPeerMap.delete(peerid);
        this.SendPeerCount(this._roomPeerMap.size);
    }


    /**
     * 
     * @param mcs 
     */
    public SetCastSetting(mcs: CastSettingSender) {
        this.CastSetting = mcs;
        this.SwPeer.SendAll(mcs);
    }


    /**
     * ストリーミングの開始
     */
    public StartStreaming() {

        let roomName = this.SwPeer.PeerId;        //  PeerIDをルーム名称とする
        let roomMode = (this.CastSetting.isSFU ? SWRoomMode.SFU : SWRoomMode.Mesh);
        this.SwRoom = new SWRoom(this, roomName, roomMode, this.Stream);

        this.ServerSend(true, false);
    }


    /**
     * ストリーミングの停止
     */
    public StopStreaming() {
        if (this.SwRoom) {
            this.SwRoom.Close();
            StreamUtil.Stop(this.Stream);
            this.ServerSend(false, false);
        }
    }


    /**
     * ストリーミングの開始/停止の通知
     * @param isStreaming 
     * @param isHide 
     */
    public ServerSend(isStreaming: boolean, isClose: boolean) {

        if (!isClose && this.CastStatus.isCasting == isStreaming)
            return;

        this.CastStatus.isCasting = isStreaming;
        this.CastStatus.isClose = isClose;
        this.CastStatus.isHide = false;
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid) + "&sfu=" + (this.CastSetting.isSFU ? 1 : 0);
        this.CastStatus.isOrientationChange = false;

        this.SendCastInfo();
    }


    /**
     * 
     */
    public SendOrientationChange() {
        this.CastStatus.isOrientationChange = true;
        this.SendCastInfo();
        this.SwPeer.SendAll(new CursorClearSender());
    }

    /**
     * ストリーミングの開始/停止の通知
     */
    public SendCastInfo() {

        //  クライアントへの通知
        this.SwPeer.SendAll(this.CastSetting);

        //  オーナー側への通知
        if (this.CastStatus) {
            this.SwPeer.SendToOwner(this.CastStatus);
        }
    }




    /**
     * 端末情報を送信
     */
    public SendTerminalInfo() {
        let info = new TerminalInfoSender();
        info.platform = window.navigator.platform;
        info.userAgent = window.navigator.userAgent;
        info.appVersion = window.navigator.appVersion;
        this.SwPeer.SendToOwner(info);
    }


    /**
     * 接続数を送信
     * @param count 
     */
    public SendPeerCount(count: number) {
        let info = new ConnCountSender();
        info.count = count;
        this.SwPeer.SendToOwner(info);
    }


    /**
     *  配信準備ができているか？
     */
    public IsReady() {
        if (this.SwPeer && this.SwPeer.HasOwner()) {
            //  チャットから呼びされた場合、チャットルーム情報が設定された場合に配信可能とする
            let r = this.CastRoom.room;
            return (r && r.hid);
        }
        else {
            //  単体起動の場合
            return true;
        }
    }

};
