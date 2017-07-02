
import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";

import CastInstanceModel from "./CastInstanceModel";
import CastInstanceView from "./CastInstanceView";
import { CastInstanceSender, CastSettingSedner } from "./CastInstanceContainer";
import { CastInstanceReceiver } from "./CastInstanceReceiver";


export default class CastInstanceController extends AbstractServiceController<CastInstanceView, CastInstanceModel> {

    public View: CastInstanceView;

    public CastInstance = new CastInstanceSender();
    public CastSetting = new CastSettingSedner();

    public AudioVisible: boolean = false;
    public VideoVisible: boolean = false;
    public AudioSource: string = null;
    public VideoSource: string = null;


    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceReceiver(this);
        this.View = new CastInstanceView(this, () => { });
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

            WebRTCService.OwnerSend(this.CastInstance);
        }
    }


    /**
     * 他クライアントからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);
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

        this.AudioVisible = (this.AudioSource !== "");
        this.VideoVisible = (this.VideoSource !== "");

        //
        WebRTCService.SetStreaming(
            this.AudioVisible,
            this.AudioSource,
            this.VideoVisible,
            this.VideoSource
        );

        //  オーナー 及び 接続クライアントに通知
        this.ServerSend((this.AudioVisible || this.VideoVisible), false);
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
        WebRTCService.ChildSendAll(this.CastSetting);

        //  オーナー側への通知
        if (this.CastInstance) {
            this.CastInstance.setting = this.CastSetting;
            WebRTCService.OwnerSend(this.CastInstance);
        }
    }

};
