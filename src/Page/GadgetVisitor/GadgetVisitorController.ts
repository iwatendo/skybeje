﻿import AbstractServiceController from "../../Base/AbstractServiceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import * as Personal from "../../Contents/IndexedDB/Personal";
import { GadgetVisitorView } from "./GadgetVisitorView";
import GadgetVisitorModel from "./GadgetVisitorModel";
import { GadgetVisitorReceiver } from "./GadgetVisitorReceiver";
import GetGadgetCastSettingSedner from "../../Contents/Sender/GetGadgetCastSettingSedner";


export default class GadgetVisitorController extends AbstractServiceController<GadgetVisitorView, GadgetVisitorModel> {

    public ControllerName(): string { return "GadgetVisitor"; }

    public PeerId: string;
    public View: GadgetVisitorView;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new GadgetVisitorReceiver(this);
    };


    /**
     * 自身のPeer生成時イベント
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        this.PeerId = peer.id;
        this.View = new GadgetVisitorView(this, () => {
            //  
        });
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  キャスト情報の要求
        this.SwPeer.SendToOwner(new GetGadgetCastSettingSedner());

        //  カーソル表示の初期化はOwnerとの接続後に開始する。
        this.View.initializeCursor();
    }


    /**
     * 
     * @param conn 
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
        super.OnDataConnectionClose(conn);
        if (this.View.Cursor) {
            this.View.Cursor.Remove(conn.remoteId);
        }
    }

};
