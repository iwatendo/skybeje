
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";

import CastInstanceModel from "./CastInstanceModel";
import CastInstanceView from "./CastInstanceView";
import { CastInstanceReceiver } from "./CastInstanceReceiver";
import StreamUtil from "../../Base/Util/StreamUtil";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";

export default class CastInstanceController extends AbstractServiceController<CastInstanceView, CastInstanceModel> {

    public ControllerName(): string { return "CastInstance"; }

    public View: CastInstanceView;

    public CastStatus = new CastStatusSender(CastTypeEnum.LiveCast);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public AudioSource: string = null;
    public VideoSource: string = null;

    public CursorCache: CursorCache;

    private _roomPeerMap = new Map<string, string>();

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceReceiver(this);
        this.CursorCache = new CursorCache();
    };


    private _peerid: string = null;


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this._peerid = peer.id;
        this.View = new CastInstanceView(this, () => { });
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
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid);
        this.SwPeer.SendToOwner(this.CastStatus);

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
     * ストリーミングの開始
     */
    public SetStreaming() {

        let msc = StreamUtil.GetMediaStreamConstraints(this.VideoSource, this.AudioSource);

        StreamUtil.GetStreaming(msc, (stream) => {
            //  PeerIDをルーム名称とする
            let roomname = this.SwPeer.PeerId;
            let roommode = (this.CastSetting.isSFU ? SWRoomMode.SFU : SWRoomMode.Mesh);
            this.SwRoom = new SWRoom(this, roomname, roommode, stream);
            //  オーナー 及び 接続クライアントに通知
            this.ServerSend((this.AudioSource !== "" || this.VideoSource !== ""), false);
        }, (errname) => {
            alert(errname);
        });

    }


    /** 
     * ストリーミングの停止
     */
    public StopStreaming() {
        this.SwRoom.Close();
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
        this.View.SetCastSetting(this.CastSetting);

        //  オーナー側への通知
        if (this.CastStatus) {
            this.SwPeer.SendToOwner(this.CastStatus);
        }
    }

};
