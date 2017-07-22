
import * as Home from "../../Base/IndexedDB/Home";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/Common/AbstractServiceModel";

import HomeInstanceController from "./HomeInstanceController";


export default class HomeInstanceModel extends AbstractServiceModel<HomeInstanceController> {

    private _homeDB: Home.DB;
    private _timelineDB: Timeline.DB;


    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._homeDB = new Home.DB();
        this._timelineDB = new Timeline.DB();

        this._homeDB.Connect(() => {
            this._timelineDB.Connect(() => {
                this.GetTimelineAll((tlmsgs) => {
                    this.Controller
                    callback();
                });
            });
        });

    }


    /**
     * 部屋情報の取得
     * @param hid 
     * @param callback 
     */
    public GetRoom(hid: string, callback: OnRead<Home.Room>) {
        this._homeDB.Read(Home.DB.ROOM, hid, callback);
    }


    /**
     * 部屋情報の取得
     * @param callback 
     */
    public GetRooms(callback: OnRead<Array<Home.Room>>) {
        this._homeDB.ReadAll(Home.DB.ROOM, callback);
    }


    /**
     * ルーム情報の削除
     * @param room 
     * @param callback 
     */
    public DeleteRoom(room: Home.Room, callback: OnWrite = null) {
        this._homeDB.Delete<Home.Room>(Home.DB.ROOM, room.hid, callback);
    }


    /**
     * タイムラインメッセージの全文取得
     * @param callback 
     */
    public GetTimelineAll(callback: OnRead<Array<Timeline.Message>>) {
        this._timelineDB.ReadAll(Timeline.DB.Message, callback);
    }

    /**
     * タイムラインメッセージの更新（追加）
     * @param msg 
     * @param callback 
     */
    public UpdateTimelineMessage(msg: Timeline.Message, callback: OnWrite) {

        let key = StdUtil.ToDispDate(new Date(msg.ctime)) + " " + msg.mid;
        this._timelineDB.Write(Timeline.DB.Message, key, msg, callback);
    }

    /**
     * タイムラインのクリア処理
     * @param callback 
     */
    public ClearTimeline(callback: OnWrite) {

        if (window.confirm('タイムラインのメッセージを全て削除します。\nよろしいですか？')) {
            this._timelineDB.ClearAll(Timeline.DB.Message, callback);
        }

    }

}
