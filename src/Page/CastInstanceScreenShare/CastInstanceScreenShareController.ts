
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";

import CastInstanceScreenShareModel from "./CastInstanceScreenShareModel";
import CastInstanceScreenShareView from "./CastInstanceScreenShareView";
import { CastInstanceScreenShareReceiver } from "./CastInstanceScreenShareReceiver";
import StreamUtil from "../../Base/Util/StreamUtil";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";


export default class CastInstanceScreenShareController extends AbstractServiceController<CastInstanceScreenShareView, CastInstanceScreenShareModel> {

    public ControllerName(): string { return "CastInstanceScreenShare"; }

    public View: CastInstanceScreenShareView;

    public CastStatus = new CastStatusSender(CastTypeEnum.ScreenShare);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;
    private _roomPeerMap = new Map<string, string>();

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceScreenShareReceiver(this);
        this.View = new CastInstanceScreenShareView(this, () => { });
        this.CursorCache = new CursorCache();
    };


    protected Initilize() {

    }


    protected _peerid: string = null;
    protected _isConnectOwner: boolean = false;


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this._peerid = peer.id;
        this.SendStageService();
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
        this._isConnectOwner = true;
        this.SendStageService();
        this.View.InitializeChatLink();
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
     * ステージ情報通知用データを作成
     */
    protected SendStageService() {

        //  peeridの取得とオーナー接続が完了している場合
        //  オーナーにURLを通知する
        if (this._isConnectOwner && this._peerid) {

            this.CastStatus = new CastStatusSender(CastTypeEnum.ScreenShare);
            this.CastStatus.instanceUrl = location.href;
            this.CastStatus.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid);

            this.SwPeer.SendToOwner(this.CastStatus);
        }
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
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.CursorCache.Remove(conn.remoteId);
    }


    /**
     * 
     */
    public OnRoomPeerJoin(peerid: string) {
        this._roomPeerMap.set(peerid, peerid);
        this.View.SetPeerCount(this._roomPeerMap.size);
    }


    /**
     * 
     */
    public OnRoomPeerLeave(peerid: string) {
        this._roomPeerMap.delete(peerid);
        this.View.SetPeerCount(this._roomPeerMap.size);
    }


    /**
     * ストリーミング開始
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    public SetStreaming(width: number, height: number, fr: number, callback) {

        StreamUtil.GetScreenSheare(this, width, height, fr, (stream) => {
            //  PeerIDをルーム名称とする
            let roomname = this.SwPeer.PeerId;
            let roommode = (this.CastSetting.isSFU ? SWRoomMode.SFU : SWRoomMode.Mesh);
            this.SwRoom = new SWRoom(this, this, this.SwPeer.Peer, roomname, roommode, stream);
            this.ServerSend(true, false);
            callback();
        });

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

};
