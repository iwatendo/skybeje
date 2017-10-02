

export enum SWRoomMode {
    Mesh = 0,
    SFU = 1,
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

    private _peer: any;
    private _room: any;
    private _mode: SWRoomMode;
    private _stream: any;
    private _sender: ISWRoom;


    public set Stream(stream) {
        this._room.replaceStream(stream);
        this._stream = stream;
    }


    public Send(data) {
        this._room.send(data);
    }


    public Close() {
        this._room.close();
    }


    /**
     * 
     * @param mode モード
     * @param name 名称
     */
    constructor(sender: ISWRoom, peer: any, mode: SWRoomMode = SWRoomMode.Mesh, name: string = "") {
        this._sender = sender;
        this._peer = peer;
        this._mode = mode;
        this._room = this.JoinRoom(name);
    }


    /**
     * 
     */
    private JoinRoom(name: string) {

        let roomName = "sbj_" + name;
        let opt = {};

        if (this._mode === SWRoomMode.Mesh) {
            if (this._stream) { opt = { stream: this._stream }; }
        }
        else {
            if (this._stream) { opt = { mode: 'sfu', stream: this._stream }; }
            else { opt = { mode: 'sfu' }; }
        }

        let room = this._peer.joinRoom(roomName, opt);

        room.on('open', () => {
            this._sender.OnRoomOpen();
        });

        room.on('error', (err) => {
            this._sender.OnRoomError(err);
        });

        room.on('close', () => {
            this._sender.OnRoomClose();
        });

        room.on('data', (msg) => {
            this._sender.OnRoomRecv(msg.src, msg.data);
        });

        room.on('peerJoin', (peerId) => {
            this._sender.OnRoomPeerJoin(peerId);
        });

        room.on('peerLeave', (peerId) => {
            this._sender.OnRoomPeerLeave(peerId);
        });

        room.on('stream', (stream) => {
            let peerId = stream.peerId;
            this._sender.OnRoomStream(peerId, stream);
        });

        room.on('removeStream', (stream) => {
            let peerId = stream.peerId;
            this._sender.OnRoomRemoveStream(peerId, stream);
        });

        return room;
    }

}