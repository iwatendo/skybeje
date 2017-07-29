import { Actor } from "../IndexedDB/Personal";

/**
 * アクターに対応するPeerID
 */
export default class ActorPeer {

    /**
     * 
     * @param peerid ピアID
     * @param uid ユーザーID
     * @param actor アクター情報
     */
    constructor(peerid: string, uid: string, actor: Actor) {
        this.peerid = peerid;
        this.uid = uid;
        this.actor = (actor === null ? new Actor() : actor);
    }

    peerid: string;
    uid: string;
    actor: Actor;
}