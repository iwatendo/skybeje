import { IServiceController } from "./IServiceController";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";
import SWPeer from "./Connect/SWPeer";
import SWRoomController from "./Connect/SWRoomController";
import { SWRoomMode } from "./Connect/SWRoom";


export default class WebRTCService {

    private static _swPeer: SWPeer;
    private static _swRoomController: SWRoomController;

    /**
     * サービス開始
     * @param service 
     * @param ownerid 
     */
    public static Start(service: IServiceController, ownerid: string, callback = null) {

        Sender.Uid = LocalCache.UserID;

        this._swPeer = new SWPeer(service, ownerid, () => {
            if (callback) {
                callback();
            }
        });
    }


    /**
     * SFUルームに接続
     * @param ownerid 
     * @param videoElement 
     */
    public static CastRoomJoin(ownerid: string, videoElement: HTMLVideoElement = null) {

        this._swRoomController = new SWRoomController(this._swPeer, ownerid, SWRoomMode.SFU);
        if (videoElement) {
            this._swRoomController.SetVideoElement(ownerid, videoElement);
        }
    }


    /**
     * ボイスチャットルームに接続
     * @param ownerid 
     * @param stream 
     */
    public static VoiceChatRoomJoin(ownerid: string, stream: any) {
        this._swRoomController = new SWRoomController(this._swPeer, ownerid, SWRoomMode.SFU, stream);
    }


    /**
     * SFURoomに接続している場合に部屋から抜ける
     */
    public static LeaveRoom() {
        if (this._swRoomController && this._swRoomController.Room) {
            this._swRoomController.Room.Close();
        }
    }


    /**
     * ストリーミング開始
     * CastInstance等の、配信オーナーが呼ぶ処理
     * @param stream 
     */
    public static StartStreaming(stream) {
        //  自身のPeerIDでRoom生成します
        this._swRoomController = new SWRoomController(this._swPeer, this._swPeer.PeerId, SWRoomMode.SFU);
        this._swRoomController.SetStream(stream);
    }


    /**
     * ストリーミングの追加
     * @param stream 
     */
    public static AddStreaming(stream) {
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