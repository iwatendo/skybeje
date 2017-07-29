import * as Home from "../../../Base/IndexedDB/Home";
import * as Personal from "../../../Base/IndexedDB/Personal";

import WebRTCService from "../../../Base/Common/WebRTCService";

import HomeVisitorController from "../HomeVisitorController";
import { GetProfileSender, GetActorSender } from "../HomeVisitorContainer";
import ActorInfo from "../../../Base/Container/ActorInfo";
import Sender from "../../../Base/Container/Sender";


interface ActorFunc { (actor: ActorInfo): void }


export default class ActorCache {

    //
    private _controller: HomeVisitorController;
    //  PeerID / Aid / Actor
    private _actorCache = new Map<string, Map<string, ActorInfo>>();
    //  function queue
    private _queue = new Map<string, Array<ActorFunc>>();


    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        this._controller = controller;
    }


    /**
     * 処理キューの登録
     * @param key 
     * @param callback 
     */
    private PushQueue(key: string, callback: ActorFunc) {
        if (this._queue.has(key)) {
            this._queue.get(key).push(callback);
        }
        else {
            let fa = new Array<ActorFunc>();
            fa.push(callback);
            this._queue.set(key, fa);
        }
    }


    /**
     * 処理キューが設定されていた場合、実行する
     * @param key 
     */
    private ExecQueue(key: string, actor: ActorInfo) {
        if (this._queue.has(key)) {
            let queues = this._queue.get(key);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(actor);
            }
        }
    }


    /**
     * アクター情報の取得
     * @param peerid 
     * @param aid 
     * @param callback 
     */
    public GetActor(peerid: string, aid: string, callback: ActorFunc) {

        if (this._controller.PeerId === peerid) {
            this._controller.Model.GetActor(aid, (actor) => {
                callback(new ActorInfo(this._controller.PeerId, Sender.Uid, actor));
            });
        }
        else {
            this._controller.ConnCache.GetExec(peerid, (conn) => {
                let key = peerid + aid;
                this.PushQueue(key, callback);
                let sender = new GetActorSender();
                sender.aid = aid;
                WebRTCService.SendTo(conn, sender);
            });
        }

    }


    /**
     * アクター情報をキャッシュ
     * @param peerid 
     * @param actor 
     */
    public SetActor(peerid: string, actor: ActorInfo) {
        if (!this._actorCache.has(peerid)) {
            this._actorCache.set(peerid, new Map<string, ActorInfo>());
        }
        let map = this._actorCache.get(peerid);
        map.set(actor.aid, actor);

        let key = peerid + actor.aid;
        this.ExecQueue(key, actor);
    }

}
