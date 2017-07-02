import * as Home from "../../Base/IndexedDB/Home";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import Sender from "../../Base/Container/Sender";
import ActorPeer from "../../Base/Container/ActorPeer";


/**
 * 強制終了通知
 */
export class ForcedTerminationSender extends Sender {

    public static ID = "ForcedTermination";

    constructor() {
        super(ForcedTerminationSender.ID);
    }
}


/**
 * エントランス情報の要求通知
 */
export class GetEntranceSender extends Sender {

    public static ID = "GetEntrance";

    constructor() {
        super(GetEntranceSender.ID)
    }

}


/**
 * エントランス情報
 */
export class EntranceSender extends Sender {

    public static ID = "Entrance";

    constructor() {
        super(EntranceSender.ID);
    }

    room: Home.Room;
}


/**
 * ルーム情報の要求通知
 */
export class GetRoomSender extends Sender {

    public static ID = "GetRoom";

    constructor(hid: string) {
        super(GetRoomSender.ID)
        this.hid = hid;
    }

    hid: string;
}


/**
 * ルーム情報
 */
export class RoomSender extends Sender {

    public static ID = "Room";

    constructor() {
        super(RoomSender.ID);
    }

    room: Home.Room;
}


/**
 * ルームに接続しているアクターメンバー情報
 */
export class RoomActorMemberSender extends Sender {

    public static ID = "RoomActorMember";

    constructor() {
        super(RoomActorMemberSender.ID);
    }

    hid: string;
    members: Array<ActorPeer>;


    /**
     * 指定アクターが含まれているか？
     * @param ram 
     * @param aid 
     */
    public static Exist(ram: RoomActorMemberSender, aid: string): boolean {

        let result = false;

        if (ram.members) {
            ram.members.forEach((n) => {
                if (n.actor.aid === aid) {
                    result = true;
                }
            });
        }
        return result;
    }


    /**
     * 指定のPeerが含まれているか？
     * @param peerid 
     */
    public static ExistPeer(ram: RoomActorMemberSender, peerid: string): boolean {
        let result = false;
        if (ram.members) {
            ram.members.forEach((n) => {
                if (n.peerid === peerid) {
                    result = true;
                }
            });
        }
        return result;
    }

}


/**
 * タイムライン通知
 */
export class TimelineSender extends Sender {

    public static ID = "Timeline";

    constructor() {
        super(TimelineSender.ID);

        this.msgs = new Array<Timeline.Message>();
    }

    msgs: Array<Timeline.Message>;
}


/**
 * タイムラインの更新用
 */
export class UpdateTimelineSender extends Sender {

    public static ID = "UpdateTimeline";

    constructor() {
        super(UpdateTimelineSender.ID);
    }

    public message: Timeline.Message;
}


/**
 * タイムラインのクリア通知
 */
export class ClearTimelineSender extends Sender {

    public static ID = "ClearTimeline";

    constructor() {
        super(ClearTimelineSender.ID);
    }
}



/**
 * サーバントの起動通知
 */
export class ServantSender extends Sender {

    public static ID = "Servant";

    constructor() {
        super(ServantSender.ID);

        this.servantPeerId = "";
        this.ownerPeerid = "";
        this.ownerAid = "";
        this.ownerIid = "";
        this.hid = "";
        this.clientUrl = "";
        this.instanceUrl = "";
        this.isStreaming = false;
    }

    public servantPeerId: string;

    public ownerPeerid: string;

    public ownerAid: string;

    public ownerIid: string;

    public hid: string;

    public clientUrl: string;

    public instanceUrl: string;

    public isStreaming: boolean;
}


/**
 * サーバントの終了通知
 */
export class ServantCloseSender extends Sender {

    public static ID = "ServantClose";

    constructor() {
        super(ServantCloseSender.ID);

        this.servantPeerId = "";
        this.ownerPeerid = "";
    }

    public servantPeerId: string;

    public ownerPeerid: string;
}



/**
 * ルーム内のサーバント一覧の通知
 */
export class RoomServantSender extends Sender {

    public static ID = "RoomServant";

    constructor() {
        super(RoomServantSender.ID);

        this.hid = "";
        this.servants = new Array<ServantSender>();
    }

    public hid: string;

    public servants: Array<ServantSender>;

}