
import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";

import LiveHTMLInstanceModel from "./LiveHTMLInstanceModel";
import LiveHTMLInstanceView from "./LiveHTMLInstanceView";
import { LiveHTMLInstanceReceiver } from "./LiveHTMLInstanceReceiver";
import CursorCache from "../../Contents/Cache/CursorCache";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import RoomSender from "../../Contents/Sender/RoomSender";
import CursorClearSender from "../../Contents/Sender/CursorClearSender";
import VoiceChatManager from "../HomeInstance/Manager/VoiceChatManager";

export default class LiveHTMLInstanceController extends AbstractServiceController<LiveHTMLInstanceView, LiveHTMLInstanceModel> {

    public ControllerName(): string { return "LiveHTMLInstance"; }

    public View: LiveHTMLInstanceView;
    public VoiceChat: VoiceChatManager;

    public CastStatus = new CastStatusSender(CastTypeEnum.LiveHTML);
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new LiveHTMLInstanceReceiver(this);
        this.VoiceChat = new VoiceChatManager(this);
        this.CursorCache = new CursorCache();
        this.Model = new LiveHTMLInstanceModel(this, () => {
            this.View = new LiveHTMLInstanceView(this, () => { });
        });
    };


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        //
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
        this.CastStatus = new CastStatusSender(CastTypeEnum.LiveHTML);
        this.CastStatus.instanceUrl = location.href;
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../LiveHTMLVisitor/index.html', this.SwPeer.PeerId);
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

        //  LiveHTML情報通知
        if (this.View.LiveHTML) {
            this.SwPeer.SendTo(conn, this.View.LiveHTML);
        }

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
        //  this.View.Cursor.Remove(conn.remoteId);
        this.VoiceChat.RemoveConnection(conn.remoteId);

        conn.close();
        this.View.SetPeerCount(this.SwPeer.GetAliveConnectionCount());
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
        this.CastStatus.clientUrl = LinkUtil.CreateLink('../LiveHTMLVisitor/index.html', this.SwPeer.PeerId);
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
        this.View.SetCastSetting(this.CastSetting);

        //  オーナー側への通知
        if (this.CastStatus) {
            this.SwPeer.SendToOwner(this.CastStatus);
        }
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
