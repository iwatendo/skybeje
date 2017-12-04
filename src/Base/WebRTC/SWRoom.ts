import LogUtil from "../Util/LogUtil";
import { IServiceController } from "../Common/IServiceController";
import SWPeer from "./SWPeer";
import Sender from "../Container/Sender";


export enum SWRoomMode {
    Default = 0,
    Mesh = 1,
    SFU = 2,
}


export interface ISWRoom {

    //
    OnRoomOpen();

    //
    OnRoomError(err);

    //
    OnRoomClose();

    //
    OnRoomPeerJoin(peerid: string);

    //
    OnRoomPeerLeave(peerid: string);

    //
    OnRoomRecv(peerid: string, recv);

    //
    OnRoomStream(peerid: string, stream);

    //
    OnRoomRemoveStream(peerid: string, stream);

}


export default class SWRoom {

    private _peer: PeerJs.Peer;
    private _service: IServiceController;
    private _stream: MediaStream;
    private _room: any;
    private _mode: SWRoomMode;
    private _sender: ISWRoom;
    private _roomName: string;


    public SetStream(stream: MediaStream) {

        this._stream = stream;
        this._room.replaceStream(this._stream);
    }


    /**
     * 
     */
    public Refresh() {
        if (this._stream) {
            this._room.replaceStream(this._stream);
        }
    }


    /**
     * 
     * @param data 
     */
    public Send(sender : Sender) {
        if (this._room) {
            let data = JSON.stringify(sender);
            this._room.send(data);
        }
    }


    /**
     * 
     */
    public Close() {
        if (this._room) {
            this._room.close();
        }
    }


    public get RoomName() {
        return this._roomName;
    }


    public set RoomName(name: string) {
        this._roomName = name;
    }


    /**
     * コンストラクタ
     * @param sender 
     * @param service 
     * @param peer 
     * @param name 
     * @param mode 
     */
    constructor(sender: ISWRoom, service: IServiceController, peer: PeerJs.Peer, name: string, mode: SWRoomMode, stream: MediaStream = null) {
        this._sender = sender;
        this._peer = peer;
        this._service = service;
        this._mode = mode;
        this._stream = stream;
        this._room = this.JoinRoom(name);
    }


    /**
     * ルーム名称
     * @param name 
     */
    public static ToRoomName(name: string) {
        return "skybeje-" + name;
    }


    /**
     * 
     */
    private JoinRoom(name: string) {

        this.RoomName = SWRoom.ToRoomName(name);

        let opt = {};

        let modestr: string;

        //  デフォルトはSFUとする
        switch (this._mode) {
            case SWRoomMode.Default: modestr = "sfu"; break;
            case SWRoomMode.Mesh: modestr = "mesh"; break;
            case SWRoomMode.SFU: modestr = "sfu"; break;
        }

        if (this._stream) {
            opt = { mode: modestr, stream: this._stream };
        }
        else {
            opt = { mode: modestr };
        }

        let room = (this._peer as any).joinRoom(this.RoomName, opt);

        room.on('open', () => {
            LogUtil.Info(this._service, "SWRoom Open");
            this._sender.OnRoomOpen();
        });

        room.on('error', (err) => {
            LogUtil.Error(this._service, "SWRoom Error : " + err);
            this._sender.OnRoomError(err);
        });

        room.on('close', () => {
            LogUtil.Info(this._service, "SWRoom Close");
            this._sender.OnRoomClose();
        });

        room.on('data', (msg) => {
            LogUtil.Info(this._service, "SWRoom Recv");
            this._sender.OnRoomRecv(msg.src, msg.data);
        });

        room.on('peerJoin', (peerId) => {
            LogUtil.Info(this._service, "SWRoom Join : " + peerId);
            this._sender.OnRoomPeerJoin(peerId);
        });

        room.on('peerLeave', (peerId) => {
            LogUtil.Info(this._service, "SWRoom Leave : " + peerId);
            this._sender.OnRoomPeerLeave(peerId);
        });

        room.on('stream', (stream) => {
            let peerId = stream.peerId;
            LogUtil.Info(this._service, "SWRoom Stream : " + peerId);
            this._sender.OnRoomStream(peerId, stream);
        });

        room.on('removeStream', (stream) => {
            let peerId = stream.peerId;
            LogUtil.Info(this._service, "SWRoom Remove Stream : " + peerId);
            this._sender.OnRoomRemoveStream(peerId, stream);
        });

        return room;
    }

}