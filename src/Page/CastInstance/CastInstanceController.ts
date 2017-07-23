
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";

import CastInstanceModel from "./CastInstanceModel";
import CastInstanceView from "./CastInstanceView";
import { CastInstanceSender, CastSettingSedner, CastCursorSender } from "./CastInstanceContainer";
import { CastInstanceReceiver } from "./CastInstanceReceiver";


export default class CastInstanceController extends AbstractServiceController<CastInstanceView, CastInstanceModel> {

    public View: CastInstanceView;

    public CastInstance = new CastInstanceSender();
    public CastSetting = new CastSettingSedner();

    public AudioSource: string = null;
    public VideoSource: string = null;

    public CursorCache: Map<string, CastCursorSender>;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceReceiver(this);
        this.View = new CastInstanceView(this, () => { });
        this.CursorCache = new Map<string, CastCursorSender>();
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

        if (!isClose && this.CastSetting.isStreaming == isStreaming)
            return;

        this.CastSetting.isStreaming = isStreaming;
        this.CastSetting.isControlClose = isClose;
        this.CastSetting.isControlHide = false;
        this.SendCastInfo();
    }


    /**
     * ストリーミングの開始/停止の通知
     */
    public SendCastInfo() {

        //  クライアントへの通知
        WebRTCService.SendToAll(this.CastSetting);

        //  オーナー側への通知
        if (this.CastInstance) {
            this.CastInstance.setting = this.CastSetting;
            WebRTCService.SendToOwner(this.CastInstance);
        }
    }


    /**
     * カーソル配置のキャッシュ
     * @param cursor
     */
    public SetCursorCache(cursor: CastCursorSender) {

        let peerid = cursor.peerid;
        if (cursor.posRx >= 0 && cursor.posRy >= 0) {
            this.CursorCache.set(peerid, cursor);
        }
        else {
            if (this.CursorCache.has(peerid)) {
                this.CursorCache.delete(peerid);
            }
        }
    }

};
