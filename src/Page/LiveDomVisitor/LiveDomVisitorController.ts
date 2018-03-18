import AbstractServiceController from "../../Base/AbstractServiceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import * as Personal from "../../Contents/IndexedDB/Personal";
import { LiveDomVisitorView } from "./LiveDomVisitorView";
import LiveDomVisitorModel from "./LiveDomVisitorModel";
import { LiveDomVisitorReceiver } from "./LiveDomVisitorReceiver";
import GetLiveDomSender from "../../Contents/Sender/GetLiveDomSender";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";


export default class LiveDomVisitorController extends AbstractServiceController<LiveDomVisitorView, LiveDomVisitorModel> {

    public ControllerName(): string { return "LiveDomVisitor"; }

    public View: LiveDomVisitorView;

    private _castPeerId: string;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new LiveDomVisitorReceiver(this);
    };


    /**
     * 自身のPeer生成時イベント
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        this.View = new LiveDomVisitorView(this, () => {
            //  
        });
    }

    public OnPeerClose() {
        MessageChannelUtil.RemoveChild(this.SwPeer.PeerId);
    }


    //  Peerエラー
    public OnPeerError(err: Error) {
        document.getElementById('sbj-livedom-visitor-message-port').hidden = false;
        document.getElementById('sbj-livedom-visitor-message').textContent = "接続に失敗、またはライブキャストは終了しています";
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
