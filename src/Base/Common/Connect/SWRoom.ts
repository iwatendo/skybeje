import LogUtil from "../../Util/LogUtil";
import { IServiceController } from "../IServiceController";
import SWPeer from "./SWPeer";



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

    private _peer: SWPeer;
    private _service: IServiceController;
    private _room: any;
    private _mode: SWRoomMode;
    private _stream: any;
    private _sender: ISWRoom;


    public set Stream(stream) {
        this._stream = stream;
        this._room.replaceStream(stream);
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
    public Send(data) {
        if (this._room) {
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


    /**
     * 
     * @param sender 
     * @param peer 
     * @param name 
     * @param mode 
     * @param any
     */
    constructor(sender: ISWRoom, peer: SWPeer, name: string, mode: SWRoomMode = SWRoomMode.Mesh, stream: any = null) {
        this._sender = sender;
        this._peer = peer;
        this._service = peer.Service;
        this._mode = mode;
        this._stream = stream;
        this._room = this.JoinRoom(name);
    }


    /**
     * ルーム名称
     * @param name 
     */
    public static ToRoomName(name) {
        return "skybeje_" + name;
    }


    /**
     * 
     */
    private JoinRoom(name: string) {

        let roomName = SWRoom.ToRoomName(name);
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

        let room = this._peer.Peer.joinRoom(roomName, opt);

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