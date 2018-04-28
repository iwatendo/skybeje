﻿import AbstractServiceController from "../../Base/AbstractServiceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import * as Personal from "../../Contents/IndexedDB/Personal";
import { LiveHTMLVisitorView } from "./LiveHTMLVisitorView";
import LiveHTMLVisitorModel from "./LiveHTMLVisitorModel";
import { LiveHTMLVisitorReceiver } from "./LiveHTMLVisitorReceiver";
import GetLiveHTMLSender from "../../Contents/Sender/GetLiveHTMLSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";


export default class LiveHTMLVisitorController extends AbstractServiceController<LiveHTMLVisitorView, LiveHTMLVisitorModel> {

    public ControllerName(): string { return "LiveHTMLVisitor"; }

    public View: LiveHTMLVisitorView;

    private _castPeerId: string;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new LiveHTMLVisitorReceiver(this);
    };


    /**
     * 自身のPeer生成時イベント
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        this.View = new LiveHTMLVisitorView(this, () => {
            //  
        });
    }

    public OnPeerClose() {
        MessageChannelUtil.RemoveChild(this.SwPeer.PeerId);
    }


    //  Peerエラー
    public OnPeerError(err: Error) {
        document.getElementById('sbj-message-layer').hidden = false;
        document.getElementById('sbj-subtitle-message').textContent = "接続に失敗、またはLiveHTMLは終了しています";
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  キャスト情報の要求
        this.SwPeer.SendToOwner(new GetCastSettingSedner());

        //  カーソル表示の初期化はOwnerとの接続後に開始する。
        this.View.InitializeCursor();
    }


    /**
     * オーナー側が切断した場合
     */
    public OnOwnerClose() {
        document.getElementById('sbj-message-layer').hidden = false;
        if (document.getElementById('sbj-subtitle-message').textContent.trim().length === 0) {
            document.getElementById('sbj-subtitle-message').textContent = "LiveHTMLは終了しました";
        }
    }


    /**
     * 
     * @param conn 
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);
    }


    /**
     * 
     * @param conn 
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.View.Cursor.Remove(conn.remoteId);
    }

};
