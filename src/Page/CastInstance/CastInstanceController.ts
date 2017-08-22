
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CursorCache from "../../Base/Common/CursorCache";
import CastInstanceSender, { CastTypeEnum } from "../../Base/Container/CastInstanceSender";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import CastInstanceModel from "./CastInstanceModel";
import CastInstanceView from "./CastInstanceView";
import { CastSettingSender } from "./CastInstanceContainer";
import { CastInstanceReceiver } from "./CastInstanceReceiver";


export default class CastInstanceController extends AbstractServiceController<CastInstanceView, CastInstanceModel> {

    public ControllerName(): string { return "CastInstance"; }

    public View: CastInstanceView;

    public CastInstance = new CastInstanceSender(CastTypeEnum.LiveCast);
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
        this.Receiver = new CastInstanceReceiver(this);
        this.View = new CastInstanceView(this, () => { });
        this.CursorCache = new CursorCache();
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

            this.CastInstance = new CastInstanceSender(CastTypeEnum.LiveCast);
            this.CastInstance.instanceUrl = location.href;
            this.CastInstance.clientUrl = LinkUtil.CreateLink('../CastVisitor/index.html', this._peerid);

            WebRTCService.SendToOwner(this.CastInstance);
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
            WebRTCService.SendTo(conn, cursor);
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
        this.CursorCache.Remove(conn.peer);
    }


    /**
     * ストリーミングの開始
     */
    public SetStreaming() {

        //
        WebRTCService.SetStreaming(this.AudioSource, this.VideoSource);

        //  オーナー 及び 接続クライアントに通知
        this.ServerSend((this.AudioSource !== "" || this.VideoSource !== ""), false);
    }


    /**
     * ストリーミングの開始/停止の通知
     * @param isStreaming 
     * @param isHide 
     */
    public ServerSend(isStreaming: boolean, isClose: boolean) {

        if (!isClose && this.CastInstance.isCasting == isStreaming)
            return;

        this.CastInstance.isCasting = isStreaming;
        this.CastInstance.isClose = isClose;
        this.CastInstance.isHide = false;
        this.SendCastInfo();
    }


    /**
     * ストリーミングの開始/停止の通知
     */
    public SendCastInfo() {

        //  クライアントへの通知
        WebRTCService.SendAll(this.CastSetting);

        //  オーナー側への通知
        if (this.CastInstance) {
            WebRTCService.SendToOwner(this.CastInstance);
        }
    }

};
