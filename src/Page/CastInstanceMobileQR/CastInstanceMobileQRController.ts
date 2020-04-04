import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import CastInstanceMobileQRModel from "./CastInstanceMobileQRModel";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import { CastInstanceMobileQRReceiver } from "./CastInstanceMobileQRReceiver";
import CastStatusSender, { CastTypeEnum } from "../../Base/Container/CastStatusSender";


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
     * データコネクション接続時イベント
     * @param conn
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
        this.View.SendOption();
    }


    /**
     * 切断時イベント
     * @param conn
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
        this.View.SetLiveCastQRCode();
        this.CastStatus.isCasting = false;
        this.SwPeer.SendToOwner(this.CastStatus);
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  オーナー側にQRコードのページの起動も通知
        this.CastStatus = new CastStatusSender(CastTypeEnum.MobileQR);
        this.SwPeer.SendToOwner(this.CastStatus);

        this.View.InitializeChatLink();
    }


    /**
     * オーナー側が切断した場合
     */
    public OnOwnerClose() {
        //  全てのクライアントとの接続を終了します
        this.SwPeer.CloseAll();
        this.PageClose();
    }

};
