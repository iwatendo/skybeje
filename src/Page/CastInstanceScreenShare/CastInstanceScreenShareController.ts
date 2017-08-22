
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import CursorCache from "../../Base/Common/CursorCache";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import CastInstanceScreenShareModel from "./CastInstanceScreenShareModel";
import CastInstanceScreenShareView from "./CastInstanceScreenShareView";
import { CastInstanceSender, CastSettingSender } from "../CastInstance/CastInstanceContainer";
import { CastInstanceScreenShareReceiver } from "./CastInstanceScreenShareReceiver";


export default class CastInstanceScreenShareController extends AbstractServiceController<CastInstanceScreenShareView, CastInstanceScreenShareModel> {

    public ControllerName(): string { return "CastInstanceScreenShare"; }

    public View: CastInstanceScreenShareView;

    public CastInstance = new CastInstanceSender();
    public CastSetting = new CastSettingSender();
    public CastRoom = new RoomSender();

    public CursorCache: CursorCache;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceScreenShareReceiver(this);
        this.View = new CastInstanceScreenShareView(this, () => { });
        this.CursorCache = new CursorCache();
        this.CastSetting.isScreenShare = true;
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
    protected SendStageService() {

        //  peeridの取得とオーナー接続が完了している場合
        //  オーナーにURLを通知する
        if (this._isConnectOwner && this._peerid) {

            this.CastInstance = new CastInstanceSender();
            this.CastInstance.setting = this.CastSetting;
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
     * ストリーミング開始
     * @param width 
     * @param height 
     * @param fr 
     * @param callback 
     */
    public SetStreaming(width: number, height: number, fr: number, callback) {

        //
        WebRTCService.SetScreenSheare(width, height, fr, () => {
            //  オーナー 及び 接続クライアントに通知
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

        if (!isClose && this.CastSetting.isStreaming == isStreaming)
            return;

        this.CastSetting.isStreaming = isStreaming;
        this.CastSetting.isScreenShare = true;
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
        if (this.CastInstance) {
            this.CastInstance.setting = this.CastSetting;
            WebRTCService.SendToOwner(this.CastInstance);
        }
    }

};
