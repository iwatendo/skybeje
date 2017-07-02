import { Actor } from "../IndexedDB/Personal";

/**
 * アクターに対応するPeerID
 */
export default class ActorPeer {

    constructor(actor: Actor, peerid: string) {
        this.actor = (actor === null ? new Actor() : actor);
        this.peerid = peerid;
    }

    actor: Actor;
    peerid: string;
}