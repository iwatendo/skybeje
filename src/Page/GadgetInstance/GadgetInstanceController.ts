import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import CastInstanceSender, { CastTypeEnum } from "../../Base/Container/CastInstanceSender";

import { RoomSender } from "../HomeInstance/HomeInstanceContainer";
import GadgetInstanceModel from "./GadgetInstanceModel";
import GadgetInstanceView from "./GadgetInstanceView";
import { GadgetCastSettingSender, YouTubeStatusSender } from "./GadgetInstanceContainer";
import { GadgetInstanceReceiver } from "./GadgetInstanceReceiver";
import { GetGuideSender } from "../HomeVisitor/HomeVisitorContainer";
import CursorCache from "../../Contents/Cache/CursorCache";


export default class GadgetInstanceController extends AbstractServiceController<GadgetInstanceView, GadgetInstanceModel> {

    public ControllerName(): string { return "GadgetInstance"; }

    public PeerId: string;
    public View: GadgetInstanceView;
    public CastInstance = new CastInstanceSender(CastTypeEnum.Gadget);
    public CastSetting = new GadgetCastSettingSender();
    public CastRoom = new RoomSender();
    public Guide = new Personal.Guide;
    public CursorCache: CursorCache;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new GadgetInstanceReceiver(this);
        this.CursorCache = new CursorCache();
        this.View = new GadgetInstanceView(this, () => { 
        });
    };


    private _isConnectOwner: boolean = false;


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this.PeerId = peer.id;
        this.SendStageService();
    }

    /**
     * 切断時処理
     */
    public OnPeerClose() {
        if (this.IsOpen) {
            this.SendToOwner_Close();
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
        this.SwPeer.Close();
        window.open('about:blank', '_self').close();
    }


    /**
     * ステージ情報通知用データを作成
     */
    private SendStageService() {

        //  peeridの取得とオーナー接続が完了している場合
        //  オーナーにURLを通知する
        if (this._isConnectOwner && this.PeerId) {

            this.CastInstance = new CastInstanceSender(CastTypeEnum.Gadget);
            this.CastInstance.instanceUrl = location.href;
            this.CastInstance.clientUrl = LinkUtil.CreateLink('../GadgetVisitor/index.html', this.PeerId);

            this.SwPeer.SendToOwner(this.CastInstance);
            this.SwPeer.SendToOwner(new GetGuideSender());
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
     *　ガジェットキャストの開始通知
     */
    public SendToOwner_CastStart() {
        let sender = this.CastInstance;
        if (sender.isCasting) {
            return;
        }
        sender.isCasting = true;
        sender.isClose = false;
        this.SwPeer.SendToOwner(sender);
    }


    /**
     * インスタンスの終了通知
     */
    public SendToOwner_Close() {
        let sender = this.CastInstance;
        sender.isCasting = false;
        sender.isHide = false;
        sender.isClose = true;
        this.SwPeer.SendToOwner(sender);
    }


    /**
     * インスタンスの非表示通知
     */
    public SendToOwner_Hide() {
        let sender = this.CastInstance;
        sender.isHide = true;
        sender.isClose = false;
        this.SwPeer.SendToOwner(sender);
    }
    

};
