import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";

import Sender from "../../Base/Container/Sender";
import ActorPeer from "../../Base/Container/ActorPeer";


/**
 * 使用するアクター情報
 */
export class UseActorSender extends Sender {

    public static ID = "UseActor";

    constructor(actor: Personal.Actor) {
        super(UseActorSender.ID);
        this.ActorPeers = new Array<ActorPeer>();
        if (actor) {
            this.CurrentAid = actor.aid;
            this.CurrentIid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);
        }
    }

    /**
     * 使用アクター
     */
    public ActorPeers: Array<ActorPeer>;


    /**
     * 現在使用しているアクターID
     */
    public CurrentAid: string;

    /**
     * 現在使用しているアイコンID
     */
    public CurrentIid: string;

}


/**
 * 
 */
export class ChatMessageSender extends Sender {

    public static ID = "ChatMessage";

    constructor() {
        super(ChatMessageSender.ID);
        this.aid = "";
        this.peerid = "";
        this.iid = "";
        this.name = "";
        this.text = "";
    }

    public aid: string;

    public peerid: string;

    public iid: string;

    public name: string;

    public text: string;

}


/**
 * 
 */
export class GetTimelineSender extends Sender {

    public static ID = "GetTimeline";

    constructor() {
        super(GetTimelineSender.ID);
        this.hid = "";
        this.count = 0;
    }

    public hid: string;
    public count: number;

}


/**
 * ユーザープロフィール要求
 */
export class GetProfileSender extends Sender {

    public static ID = "GetProfile";

    constructor() {
        super(GetProfileSender.ID);
    }
}


/**
 * 
 */
export class ProfileSender extends Sender {

    public static ID = "Profile";

    constructor() {
        super(ProfileSender.ID);
    }

    public profile: Personal.Actor;
}


/**
 * アクター情報要求
 */
export class GetActorSender extends Sender {

    public static ID = "GetActor";

    constructor() {
        super(GetActorSender.ID);
        this.aid = "";
    }

    public aid: string;
}


/**
 * 
 */
export class ActorSender extends Sender {

    public static ID = "Actor";

    constructor() {
        super(ActorSender.ID);
    }

    public actor: Personal.Actor;
}


/**
 * 
 */
export class GetIconSender extends Sender {

    public static ID = "GetIcon";

    constructor() {
        super(GetIconSender.ID);
        this.iid = "";
    }

    public iid: string;
}


/**
 * 
 */
export class IconSender extends Sender {
    public static ID = "Icon";

    constructor() {
        super(IconSender.ID);
    }

    public icon: Personal.Icon;

}