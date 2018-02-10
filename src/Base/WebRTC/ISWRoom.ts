export default interface ISWRoom {

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
