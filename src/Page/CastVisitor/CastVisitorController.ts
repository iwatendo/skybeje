import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import ConnectionCache from "../../Base/Common/ConnectionCache";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";
import * as Personal from "../../Base/IndexedDB/Personal";
import { CastVisitorView } from "./CastVisitorView";
import CastVisitorModel from "./CastVisitorModel";
import { CastVisitorReceiver } from "./CastVisitorReceiver";
import { GetCastInfoSedner } from "../CastInstance/CastInstanceContainer";


export default class CastVisitorController extends AbstractServiceController<CastVisitorView, CastVisitorModel> {

    public ConnCache: ConnectionCache;
    public View: CastVisitorView;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new CastVisitorReceiver(this);
        this.ConnCache = new ConnectionCache();
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
        WebRTCService.SendToOwner(new GetCastInfoSedner());

        //  カーソル表示の初期化はOwnerとの接続後に開始する。
        this.View.initializeCursor();
    }


    /**
     * 
     * @param conn 
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        LogUtil.Info('child connection : ' + conn.peer.toString());
        this.ConnCache.Set(conn);
    }


    /**
     * ストリーミングの再生開始後の処理
     */
    public OnStreamingPlay() {
        if (this.View && this.View.Cursor) {
            this.View.Cursor.DisplayAll();
        }
    }

};
