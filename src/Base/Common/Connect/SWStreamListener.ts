import StdUtil from "../../Util/StdUtil";
import LogUtil from "../../Util/LogUtil";
import { IServiceController } from "../IServiceController";
import SWPeer from "./SWPeer";
import SWRoom, { ISWRoom, SWRoomMode } from "./SWRoom";


interface OnGetMediaStream { (stream: MediaStream): void }
declare var SkyWay: any;

export default class SWStreamListener implements ISWRoom {

    private _service: IServiceController;
    private _swPeer: SWPeer;
    private _swRoom: SWRoom;
    private _videoElement: HTMLVideoElement;


    /**
     * 
     * @param service 
     * @param swPeer 
     * @param roomName 
     * @param videoElement 
     */
    constructor(service: IServiceController, swPeer: SWPeer, roomName: string, videoElement: HTMLVideoElement) {
        this._service = service;
        this._swPeer = swPeer;
        this._videoElement = videoElement;

        this._swRoom = new SWRoom(this, swPeer, roomName, SWRoomMode.Default);
    }


    /**
     * スリープ関数
     * @param milliseconds 
     */
    private Sleep(milliseconds: number) {
        return new Promise<void>(resolve => { setTimeout(() => resolve(), milliseconds); });
    }

    /**
     * 
     */
    public OnRoomOpen() {

        //  【削除予定】
        //  受信モードでRoomに接続すると、SFUのストリーム通知が来ないケースがある。
        //  PeerJoin / PeerLeave が発生すると stream通知が来るようなので、SkyWay側での対応されるまでの暫定対応
        SWPeer.GetApiKey((apikey) => {
            let peer = new Peer({ key: apikey, debug: 1 }) as any;
            peer.on('open', 　async () => {
                await this.Sleep(1000);
                let name = this._swRoom.RoomName;
                let room = peer.joinRoom(name, { mode: "sfu" });
                room.on('open', async () => {
                    await this.Sleep(2000);
                    peer.destroy();
                });
            });
        });

    }


    /**
     * 
     * @param err 
     */
    public OnRoomError(err: any) {
    }


    /**
     * 
     */
    public OnRoomClose() {
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerJoin(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerLeave(peerid: string) {
    }


    /**
     * 
     * @param peerid 
     * @param recv 
     */
    public OnRoomRecv(peerid: string, recv: any) {
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: any) {
        if (this._videoElement) {
            this._videoElement.srcObject = stream;
            this._videoElement.play();
        }
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {
    }


}