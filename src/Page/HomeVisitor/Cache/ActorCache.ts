import * as Home from "../../../Base/IndexedDB/Home";
import * as Personal from "../../../Base/IndexedDB/Personal";

import WebRTCService from "../../../Base/Common/WebRTCService";

import HomeVisitorController from "../HomeVisitorController";
import { GetProfileSender, GetActorSender } from "../HomeVisitorContainer";


interface ActorFunc { (actor: Personal.Actor): void }


export default class ActorCache {

    //
    private _controller: HomeVisitorController;
    //  PerrID / UserProfile
    private _profileCache = new Map<string, Personal.Actor>();
    //  PeerID / Aid / Actor
    private _actorCache = new Map<string, Map<string, Personal.Actor>>();
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
    private ExecQueue(key: string, actor: Personal.Actor) {
        if (this._queue.has(key)) {
            let queues = this._queue.get(key);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(actor);
            }
        }
    }


    /**
     * ユーザープロフィールの取得
     * @param peerid 
     * @param callback 
     */
    public GetProfile(peerid: string, callback: ActorFunc) {

        if (this._controller.PeerId === peerid) {
            this._controller.Model.GetUserProfile((actor) => {
                callback(actor);
            });
        }
        else {
            this._controller.ConnCache.GetExec(peerid, (conn) => {

                this.PushQueue(peerid, callback);
                //  プロフィール要求
                let sender = new GetProfileSender();
                WebRTCService.SendTo(conn, sender);

            });
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
                callback(actor);
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
     * 他ユーザーのプロフィール情報をキャッシュ
     * @param peerid 
     * @param profile 
     */
    public SetOtherProfile(peerid: string, profile: Personal.Actor) {
        this._profileCache.set(peerid, profile);
        this.SetOtherActor(peerid, profile);

        let key = peerid;
        this.ExecQueue(key, profile);
    }


    /**
     * 他ユーザーのアクター情報をキャッシュ
     * @param peerid 
     * @param actor 
     */
    public SetOtherActor(peerid: string, actor: Personal.Actor) {
        if (!this._actorCache.has(peerid)) {
            this._actorCache.set(peerid, new Map<string, Personal.Actor>());
        }
        let map = this._actorCache.get(peerid);
        map.set(actor.aid, actor);

        let key = peerid + actor.aid;
        this.ExecQueue(key, actor);
    }

}
