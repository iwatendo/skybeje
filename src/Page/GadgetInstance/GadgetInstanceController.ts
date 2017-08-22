
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import IconCursorSender  from "../../Base/Container/IconCursorSender";

import GadgetInstanceModel from "./GadgetInstanceModel";
import GadgetInstanceView from "./GadgetInstanceView";
import { GadgetInstanceSender, CastSettingSender, CastRoomSender } from "./GadgetInstanceContainer";
import { GadgetInstanceReceiver } from "./GadgetInstanceReceiver";


export default class GadgetInstanceController extends AbstractServiceController<GadgetInstanceView, GadgetInstanceModel> {

    public ControllerName(): string { return "GadgetInstance"; }

    public View: GadgetInstanceView;

    public GadgetInstance = new GadgetInstanceSender();
    public CastSetting = new CastSettingSender();
    public CastRoom = new CastRoomSender();
    public CursorCache: Map<string, IconCursorSender>;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new GadgetInstanceReceiver(this);
        this.View = new GadgetInstanceView(this, () => { });
        this.CursorCache = new Map<string, IconCursorSender>();
    };


    private _peerid: string = null;
    private _isConnectOwner: boolean = false;


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
    }


    /**
     * オーナー側が切断した場合
     */
    public OnOwnerClose() {
        //  全てのクライアントとの接続を終了します
        WebRTCService.Close();
        window.open('about:blank', '_self').close();
    }


    /**
     * ステージ情報通知用データを作成
     */
    private SendStageService() {

        //  peeridの取得とオーナー接続が完了している場合
        //  オーナーにURLを通知する
        if (this._isConnectOwner && this._peerid) {

            this.GadgetInstance = new GadgetInstanceSender();
            this.GadgetInstance.setting = this.CastSetting;
            this.GadgetInstance.instanceUrl = location.href;
            this.GadgetInstance.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid);

            WebRTCService.SendToOwner(this.GadgetInstance);
        }
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);

        //  配置済みカーソルの通知
        this.CursorCache.forEach((value, key) => {
            WebRTCService.SendTo(conn, value);
        });

        this.View.SetPeerCount(WebRTCService.GetAliveConnectionCount());
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.View.SetPeerCount(WebRTCService.GetAliveConnectionCount());
        this.RemoveCursorCache(conn.peer);
    }
    

    /**
     * ストリーミングの開始/停止の通知
     * @param isStreaming 
     * @param isHide 
     */
    public ServerSend(isStreaming: boolean, isClose: boolean) {

        if (!isClose && this.CastSetting.isStreaming == isStreaming)
            return;

        this.CastSetting.isStreaming = isStreaming;
        this.CastSetting.isScreenShare = false;
        this.CastSetting.isControlClose = isClose;
        this.CastSetting.isControlHide = false;
        this.SendCastInfo();
    }


    /**
     * ストリーミングの開始/停止の通知
     */
    public SendCastInfo() {

        //  クライアントへの通知
        WebRTCService.SendAll(this.CastSetting);

        //  オーナー側への通知
        if (this.GadgetInstance) {
            this.GadgetInstance.setting = this.CastSetting;
            WebRTCService.SendToOwner(this.GadgetInstance);
        }
    }


    /**
     * カーソル配置のキャッシュ
     * @param cursor
     */
    public SetCursorCache(cursor: IconCursorSender) {

        let peerid = cursor.visitorPeerId;
        if (cursor.posRx >= 0 && cursor.posRy >= 0) {
            this.CursorCache.set(peerid, cursor);
        }
        else {
            if (this.CursorCache.has(peerid)) {
                this.CursorCache.delete(peerid);
            }
        }
    }


    /**
     * ピアの切断等によるカーソルの削除
     * @param peerid 
     */
    public RemoveCursorCache(peerid: string) {
        if (this.CursorCache.has(peerid)) {
            this.CursorCache.delete(peerid);
        }
    }

};
