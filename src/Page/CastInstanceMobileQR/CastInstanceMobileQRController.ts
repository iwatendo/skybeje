import AbstractServiceController from "../../Base/AbstractServiceController";
import StdUtil from "../../Base/Util/StdUtil";
import CastInstanceMobileQRModel from "./CastInstanceMobileQRModel";
import CastInstanceMobileQRView from "./CastInstanceMobileQRView";
import { CastInstanceMobileQRReceiver } from "./CastInstanceMobileQRReceiver";


export default class CastInstanceMobileQRController extends AbstractServiceController<CastInstanceMobileQRView, CastInstanceMobileQRModel> {

    public ControllerName(): string { return "CastInstanceMobileQR"; }

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

};
