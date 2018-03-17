
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";

import LiveDomInstanceModel from "./LiveDomInstanceModel";
import LiveDomInstanceView from "./LiveDomInstanceView";
import { LiveDomInstanceReceiver } from "./LiveDomInstanceReceiver";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";

export default class LiveDomInstanceController extends AbstractServiceController<LiveDomInstanceView, LiveDomInstanceModel> {

    public ControllerName(): string { return "LiveDomInstance"; }

    public View: LiveDomInstanceView;

    public CastStatus = new CastStatusSender(CastTypeEnum.LiveDom);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new LiveDomInstanceReceiver(this);
        this.CursorCache = new CursorCache();
    };


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this.View = new LiveDomInstanceView(this, () => { });
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
        this.CastStatus = new CastStatusSender(CastTypeEnum.LiveDom);
        this.CastStatus.instanceUrl = location.href;
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../LiveDomVisitor/index.html', this.SwPeer.PeerId);
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
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());

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
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
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
     * ストリーミングの開始/停止の通知
     * @param isCasting 
     * @param isHide 
     */
    public ServerSend(isCasting: boolean, isClose: boolean) {

        if (!isClose && this.CastStatus.isCasting == isCasting)
            return;

        this.CastStatus.isCasting = isCasting;
        this.CastStatus.isClose = isClose;
        this.CastStatus.isHide = false;
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../LiveDomVisitor/index.html', this.SwPeer.PeerId);
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
