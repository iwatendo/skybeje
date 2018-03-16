import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import CastInstanceMobileQRModel from "./CastInstanceMobileQRModel";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import { CastInstanceMobileQRReceiver } from "./CastInstanceMobileQRReceiver";
import CastStatusSender from "../../Base/Container/CastStatusSender";


export default class CastInstanceMobileQRController extends AbstractServiceController<CastInstanceMobileQRView, CastInstanceMobileQRModel> {

    public ControllerName(): string { return "CastInstanceMobileQR"; }

    public CastStatus: CastStatusSender;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new CastInstanceMobileQRReceiver(this);
    };


    protected Initilize() {
    }


    /**
     * 自身のPeer生成時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this.View = new CastInstanceMobileQRView(this, () => { });
    }


    /**
     * 子Peerからの接続時イベント
     * @param conn
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        this.View.SendOption();
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        this.View.SetLiveCastQRCode();
        this.CastStatus.isCasting = false;
        this.SwPeer.SendToOwner(this.CastStatus);
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {
        this.View.InitializeChatLink();
    }

};
