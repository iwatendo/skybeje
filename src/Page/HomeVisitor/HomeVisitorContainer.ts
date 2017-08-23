import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";

import Sender from "../../Base/Container/Sender";
import ActorInfo from "../../Base/Container/ActorInfo";


/**
 * クライアントの起動通知
 */
export class ClientBootSender extends Sender {

    public static ID = "ClientBoot";

    constructor() {
        super(ClientBootSender.ID);
    }
}


/**
 * 使用するアクター情報
 */
export class UseActorSender extends Sender {

    public static ID = "UseActor";

    constructor() {
        super(UseActorSender.ID);
        this.ActorInfos = new Array<ActorInfo>();
    }

    /**
     * 使用アクター
     */
    public ActorInfos: Array<ActorInfo>;

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
        this.gid = "";
        this.name = "";
        this.text = "";
    }

    public aid: string;

    public peerid: string;

    public iid: string;

    public gid: string;

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
export class ActorInfoSender extends Sender {

    public static ID = "ActorInfo";

    constructor() {
        super(ActorInfoSender.ID);
    }

    public actorInfo: ActorInfo;
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


/**
 * 
 */
export class GetGuideSender extends Sender {

    public static ID = "GetGuide";

    constructor() {
        super(GetGuideSender.ID);
    }
}


/**
 * 
 */
export class GuideSender extends Sender {
    public static ID = "Guide";

    constructor() {
        super(GuideSender.ID);
    }

    public guide: Personal.Guide;

}