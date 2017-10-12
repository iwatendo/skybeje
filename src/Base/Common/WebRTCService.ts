import { IServiceController } from "./IServiceController";
import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";
import StdUtil from "../Util/StdUtil";
import SWPeer from "./Connect/SWPeer";
import SWRoom from "./Connect/SWRoom";
import SWRoomController from "./Connect/SWRoomController";
import StreamUtil from "../Util/StreamUtil";


interface OnGetMediaStream { (stream: MediaStream): void }

declare var SkyWay: any;

export default class WebRTCService {

    private static _swPeer: SWPeer;
    private static _swRoomController: SWRoomController;

    /**
     * WebRTCServiceの起動
     * @param service
     * @param ownerid
     * @param name
     */
    public static Start(service: IServiceController, ownerid: string, serviceName: string, videoElement: HTMLVideoElement = null) {

        Sender.Uid = LocalCache.UserID;

        this._swPeer = new SWPeer(service, ownerid, (swp) => {
            if (videoElement) {
                //  受信用
                this._swRoomController = new SWRoomController(this._swPeer, ownerid);
                this._swRoomController.SetVideoElement(ownerid, videoElement);
            }
        });

    }


    //  SWPeer Wrapper
    public static PeerId(): string { return (this._swPeer ? this._swPeer.PeerId : ""); }
    public static OwnerPeerId(): string { return (this._swPeer ? this._swPeer.OwnerPeerId : ""); }
    public static GetAliveConnectionCount(): number { return this._swPeer.GetAliveConnectionCount(); }
    public static Close() { this._swPeer.Close(); }
    public static SendToOwner(data: Sender) { this._swPeer.SendToOwner(data); }
    public static SendTo(peer: string | PeerJs.DataConnection, data: Sender) { this._swPeer.SendTo(peer, data); }
    public static SendAll(data: Sender) { this._swPeer.SendAll(data); }

    public static SetStreaming(audioSource: string, videoSource: string) {
        StreamUtil.SetStreaming(audioSource, videoSource, (stream) => {
            //  送信用
            this._swRoomController = new SWRoomController(this._swPeer, this._swPeer.PeerId);
            this._swRoomController.SetStream(stream);
        });
    }

    public static SetScreenSheare(width: number, height: number, fr: number, callback) {
        StreamUtil.SetScreenSheare(width, height, fr, (stream)=>{
            //  送信用
            this._swRoomController = new SWRoomController(this._swPeer, this._swPeer.PeerId);
            this._swRoomController.SetStream(stream);
            callback();
        });
    }

}