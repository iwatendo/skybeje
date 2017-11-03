import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import * as Personal from "../../Base/IndexedDB/Personal";
import { CastVisitorView } from "./CastVisitorView";
import CastVisitorModel from "./CastVisitorModel";
import { CastVisitorReceiver } from "./CastVisitorReceiver";
import { GetCastSettingSedner } from "../CastInstance/CastInstanceContainer";


export default class CastVisitorController extends AbstractServiceController<CastVisitorView, CastVisitorModel> {

    public ControllerName(): string { return "CastVisitor"; }

    public View: CastVisitorView;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new CastVisitorReceiver(this);
    };


    /**
     * 自身のPeer生成時イベント
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        this.View = new CastVisitorView(this, () => {
            //  
        });
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  キャスト情報の要求
        WebRTCService.SendToOwner(new GetCastSettingSedner());

        //  カーソル表示の初期化はOwnerとの接続後に開始する。
        this.View.InitializeCursor();
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
        this.View.Cursor.Remove(conn.peer);
    }

};
