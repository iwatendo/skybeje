import StdUtil from "../../Util/StdUtil";
import LogUtil from "../../Util/LogUtil";
import { IServiceController } from "../IServiceController";
import SWPeer from "./SWPeer";
import SWRoom, { ISWRoom, SWRoomMode } from "./SWRoom";


interface OnGetMediaStream { (stream: MediaStream): void }
declare var SkyWay: any;

export default class SWRoomController implements ISWRoom {

    private _service: IServiceController;
    private _peer: PeerJs.Peer;
    private _elementMap = new Map<string, HTMLVideoElement>();

    public Room: SWRoom;

    /**
     * コンストラクタ
     * @param swPeer 
     * @param roomName 
     * @param mode 
     * @param stream 
     */
    constructor(swPeer: SWPeer, roomName: string, mode: SWRoomMode, stream: any = null) {
        this._service = swPeer.Service;
        this._peer = swPeer.Peer;
        this.Room = new SWRoom(this, this._service, this._peer, roomName, mode, stream);
    }


    /**
     * 
     * @param peerid 
     * @param videoElement 
     */
    public SetVideoElement(peerid: string, videoElement: HTMLVideoElement) {
        if (this._elementMap.has(peerid)) {
            let preElement = this._elementMap.get(peerid);
        }
        else {
            this._elementMap.set(peerid, videoElement);
        }
    }


    /**
     * 
     * @param stream 
     */
    public SetStream(stream: any) {
        this.Room.SetStream(stream);
    }


    /**
     * 接続している部屋から離脱します
     */
    public LeaveRoom() {
        if (this.Room) {
            this.Room.Close();
        }
    }


    /**
     * 
     * @param peerid 
     */
    public GetVideoElement(peerid): HTMLVideoElement {

        if (this._elementMap.has(peerid)) {
            return this._elementMap.get(peerid);
        }
        else {
            let newElement: HTMLVideoElement = document.createElement('video');
            newElement.id = peerid;
            this._elementMap.set(peerid, newElement);
            return newElement;
        }

    }


    /**
     * スリープ関数
     * @param milliseconds 
     */
    private Sleep(milliseconds: number) {
        return new Promise<void>(resolve => { setTimeout(() => resolve(), milliseconds); });
    }


    /**
     *【削除予定】
     * 受信モードでRoomに接続すると、SFUのストリームが流れて来ないケースが発生
     * PeerJoin / PeerLeave が発生すると streamが流れてくる来るようなので、SkyWay側での対応されるまでの暫定対応
     */
    public DummyJoin() {

        SWPeer.GetApiKey((apikey) => {
            let peer = new Peer({ key: apikey, debug: 1 }) as any;
            peer.on('open', async () => {
                await this.Sleep(1000);
                let name = this.Room.RoomName;
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
     */
    public OnRoomOpen() {
        this.DummyJoin();
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

        let element = this.GetVideoElement(peerid);

        if (element) {
            element.srcObject = stream;
            element.play();
        }
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {
        let element = this.GetVideoElement(peerid);

        if (element) {
            element.pause();
        }
    }

}