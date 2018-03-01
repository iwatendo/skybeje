
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CastInstanceMobileSender, { CastTypeEnum } from "../../Base/Container/CastInstanceSender";

import CastInstanceMobileModel from "./CastInstanceMobileModel";
import CastInstanceMobileView from "./CastInstanceMobileView";
import { CastInstanceMobileReceiver } from "./CastInstanceMobileReceiver";
import StreamUtil from "../../Base/Util/StreamUtil";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";

export default class CastInstanceMobileController extends AbstractServiceController<CastInstanceMobileView, CastInstanceMobileModel> {

    public ControllerName(): string { return "CastInstanceMobile"; }

    public View: CastInstanceMobileView;

    public CastInstanceMobile = new CastInstanceMobileSender(CastTypeEnum.LiveCast);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public AudioSource: string = null;
    public VideoSource: string = null;

    public CursorCache: CursorCache;

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
        this.CastInstanceMobile = new CastInstanceMobileSender(CastTypeEnum.LiveCast);
        this.CastInstanceMobile.instanceUrl = location.href;
        this.CastInstanceMobile.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid);
        this.SwPeer.SendToOwner(this.CastInstanceMobile);
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

        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
        this.CursorCache.Remove(conn.peer);
    }


    /**
     * ストリーミングの開始
     */
    public SetStreaming() {

        let msc = StreamUtil.GetMediaStreamConstraints(this.VideoSource, this.AudioSource);
        StreamUtil.GetStreaming(msc, (stream) => {
            this.SwRoom.SetStream(stream);
        }, (errname) => {
            alert(errname);
        });

        //  オーナー 及び 接続クライアントに通知
        this.ServerSend((this.AudioSource !== "" || this.VideoSource !== ""), false);
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

        if (!isClose && this.CastInstanceMobile.isCasting == isStreaming)
            return;

        this.CastInstanceMobile.isCasting = isStreaming;
        this.CastInstanceMobile.isClose = isClose;
        this.CastInstanceMobile.isHide = false;
        this.SendCastInfo();
    }


    /**
     * ストリーミングの開始/停止の通知
     */
    public SendCastInfo() {

        //  クライアントへの通知
        this.SwPeer.SendAll(this.CastSetting);

        //  オーナー側への通知
        if (this.CastInstanceMobile) {
            this.SwPeer.SendToOwner(this.CastInstanceMobile);
        }
    }

};
