import * as Home from "../../Base/IndexedDB/Home";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Base/Container/ActorInfo";
import { CastTypeEnum } from "../../Base/Container/CastInstanceSender";



/**
 * 接続情報
 */
export class ConnInfoSender extends Sender {
    public static ID = "ConnInfo";

    constructor() {
        super(ConnInfoSender.ID);
        this.starttime = Date.now();
        this.isConnect = false;
        this.isBootCheck = false;
        this.isMultiBoot = false;
    }

    starttime: number;
    isConnect: boolean;
    isBootCheck : boolean;
    isMultiBoot : boolean;
}


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
    members: Array<ActorInfo>;


    /**
     * 指定アクターが含まれているか？
     * @param ram 
     * @param aid 
     */
    public static Exist(ram: RoomActorMemberSender, aid: string): boolean {

        let result = false;

        if (ram.members) {
            ram.members.forEach((ai) => {
                if (ai.aid === aid) {
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
        this.castType = CastTypeEnum.None;
        this.isCasting = false;
    }

    public servantPeerId: string;

    public ownerPeerid: string;

    public ownerAid: string;

    public ownerIid: string;

    public hid: string;

    public clientUrl: string;

    public instanceUrl: string;

    public castType: CastTypeEnum;

    /**
     * 配信有無
     * インスタンスが起動していても、以下のフラグがTrueになっていない場合配信されない事に注意
     */
    public isCasting: boolean;
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