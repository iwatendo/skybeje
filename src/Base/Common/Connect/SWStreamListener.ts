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
     * 
     */
    public OnRoomOpen() {
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