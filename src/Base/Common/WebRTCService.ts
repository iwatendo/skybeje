import { IServiceController } from "./IServiceController";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";
import SWPeer from "./Connect/SWPeer";
import SWRoomController from "./Connect/SWRoomController";

export default class WebRTCService {

    private static _swPeer: SWPeer;
    private static _swRoomController: SWRoomController;

    /**
     * WebRTCServiceの起動
     * @param service
     * @param ownerid
     * @param name
     */
    public static Start(service: IServiceController, ownerid: string, videoElement: HTMLVideoElement = null) {

        Sender.Uid = LocalCache.UserID;

        this._swPeer = new SWPeer(service, ownerid, (swp) => {
            if (videoElement) {
                //  受信用
                this._swRoomController = new SWRoomController(this._swPeer, ownerid);
                this._swRoomController.SetVideoElement(ownerid, videoElement);
            }
        });
    }


    /**
     * ストリーミング開始
     * @param stream 
     */
    public static SetStreaming(stream) {
        //  送信用
        this._swRoomController = new SWRoomController(this._swPeer, this._swPeer.PeerId);
        this._swRoomController.SetStream(stream);
    }


    //  SWPeer Wrapper
    public static PeerId(): string { return (this._swPeer ? this._swPeer.PeerId : ""); }
    public static OwnerPeerId(): string { return (this._swPeer ? this._swPeer.OwnerPeerId : ""); }
    public static GetAliveConnectionCount(): number { return this._swPeer.GetAliveConnectionCount(); }
    public static Close() { this._swPeer.Close(); }
    public static SendToOwner(data: Sender) { this._swPeer.SendToOwner(data); }
    public static SendTo(peer: string | PeerJs.DataConnection, data: Sender) { this._swPeer.SendTo(peer, data); }
    public static SendAll(data: Sender) { this._swPeer.SendAll(data); }

}