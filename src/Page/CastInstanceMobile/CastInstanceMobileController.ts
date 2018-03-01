
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
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

export default class CastInstanceMobileController extends AbstractServiceController<CastInstanceMobileView, CastInstanceMobileModel> {

    public ControllerName(): string { return "CastInstanceMobile"; }

    public View: CastInstanceMobileView;

    public CastStatus = new CastStatusSender(CastTypeEnum.LiveCast);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;
    public Stream: MediaStream;

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
        this.SwPeer.Close();
        window.open('about:blank', '_self').close();
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);

        //  配置済みカーソルの通知
        this.CursorCache.forEach((cursor) => {
            this.SwPeer.SendTo(conn, cursor);
        });

        this.SendPeerCount(this.SwPeer.GetAliveConnectionCount());
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.SendPeerCount(this.SwPeer.GetAliveConnectionCount());
        this.CursorCache.Remove(conn.peer);
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
        this.SwRoom = new SWRoom(this, this, this.SwPeer.Peer, roomName, roomMode, this.Stream);

        this.ServerSend(true, false);
    }


    /**
     * ストリーミングの停止
     */
    public StopStreaming() {
        this.SwRoom.Close();
        StreamUtil.Stop(this.Stream);
        this.ServerSend(false, false);
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

        this.SendCastInfo();
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

};
