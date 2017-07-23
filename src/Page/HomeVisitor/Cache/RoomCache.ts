import * as Home from "../../../Base/IndexedDB/Home";
import * as Personal from "../../../Base/IndexedDB/Personal";

import WebRTCService from "../../../Base/Common/WebRTCService";

import HomeVisitorController from "../HomeVisitorController";
import { GetRoomSender, RoomActorMemberSender } from "../../HomeInstance/HomeInstanceContainer";


interface RoomFunc { (room: Home.Room): void }
interface RoomActorMemberFunc { (ram: RoomActorMemberSender): void }


export default class RoomCache {

    //
    private _controller: HomeVisitorController;
    //  hid / Room
    private _roomCache = new Map<string, Home.Room>();
    //  hid / RoomActorMember
    private _roomMemberCache = new Map<string, RoomActorMemberSender>();
    //
    private _queue = new Map<string, Array<RoomFunc>>();
    //
    private _nowRoomHids = new Array<string>();


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
    private PushQueue(key: string, callback: RoomFunc) {
        if (this._queue.has(key)) {
            this._queue.get(key).push(callback);
        }
        else {
            let ra = new Array<RoomFunc>();
            ra.push(callback);
            this._queue.set(key, ra);
        }
    }


    /**
     * 処理キューが設定されていた場合、実行する
     * @param key 
     */
    private ExecQueue(key: string, room: Home.Room) {
        if (this._queue.has(key)) {
            let queues = this._queue.get(key);
            while (queues.length > 0) {
                let queue = queues.pop();
                queue(room);
            }
        }
    }


    /**
     * ルーム情報をキャッシュ
     * @param peerid 
     * @param room 
     */
    public Set(room: Home.Room) {
        this._roomCache.set(room.hid, room);
        this.ExecQueue(room.hid, room);
    }


    /**
     * ルーム情報の取得
     * @param peerid 
     * @param hid 
     * @param callback 
     */
    public Get(hid: string, callback: RoomFunc) {

        if (this._roomCache.has(hid)) {
            let room = this._roomCache.get(hid);
            callback(room);
        }
        else {
            this.PushQueue(hid, callback);
            let sender = new GetRoomSender(hid);
            WebRTCService.SendToOwner(sender);
        }
    }


    /**
     * ルームメンバーのキャッシュ
     * @param ram 
     */
    public SetMember(ram: RoomActorMemberSender) {
        this._roomMemberCache.set(ram.hid, ram);

        this._nowRoomHids = new Array<string>();
        this._controller.UseActor.ActorPeers.forEach((ap) => {
            this.GetRoomByActorId(ap.actor.aid, (room) => {
                if (0 === this._nowRoomHids.filter((hid) => hid === room.hid).length) {
                    this._nowRoomHids.push(room.hid);
                }
            });
        });
    }


    /**
     * 自分が保持しているアクターが
     * 配置されている部屋の一覧を取得
     */
    public GetRooms(): Array<Home.Room> {
        let result = new Array<Home.Room>();
        this._nowRoomHids.forEach((hid) => {
            result.push(this._roomCache.get(hid));
        });
        return result;
    }


    /**
     * ルームメンバーの取得
     * @param hid 
     * @param callback 
     */
    public GetMember(hid: string, callback: RoomActorMemberFunc) {
        if (this._roomMemberCache.has(hid)) {
            let result = this._roomMemberCache.get(hid);
            callback(result);
        }
    }


    /**
     * 指定アクターIDが配置されているRoom情報を取得
     * @param aid 
     * @param callback 
     */
    public GetRoomByActorId(aid: string, callback: RoomFunc) {

        this._roomMemberCache.forEach((rams, hid) => {
            rams.members.forEach((ap) => {
                if (aid === ap.actor.aid) {
                    this.Get(hid, callback);
                    return;
                }
            });
        });
    }


    /**
     * 自身のアクターが所属するルームのメンバーの中で
     * 対応するPeerIDががあるか確認
     * @param peerid 
     */
    public IsInPeer(peerid: string) {

        let result: boolean = false;

        //  自身が使用しているアクター
        let useAps = this._controller.UseActor.ActorPeers;

        //  メンバーキャスト
        this._roomMemberCache.forEach((rams, hid) => {

            let hasPeer = false;
            let hasUseAct = false;

            rams.members.forEach((ram) => {
                if (ram.peerid === peerid) {
                    hasPeer = true;
                }

                useAps.forEach((ap) => {
                    if (ap.peerid == ram.peerid && ap.actor.aid == ram.actor.aid) {
                        hasUseAct = true;
                    }
                });
            });

            if (hasPeer && hasUseAct) {
                result = true;
                return;
            }
        });

        return result;
    }

}