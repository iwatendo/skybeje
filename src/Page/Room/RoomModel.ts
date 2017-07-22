
import * as Home from "../../Base/IndexedDB/Home";

import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/Common/AbstractServiceModel";
import RoomController from "./RoomController";


export default class RoomModel extends AbstractServiceModel<RoomController> {

    private _homeDB: Home.DB;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._homeDB = new Home.DB();

        this._homeDB.Connect(() => {
            callback();
        });
    }


    /**
     * ルームリストの取得
     * @param hid 
     * @param callback 
     */
    public GetRooms(callback: OnRead<Array<Home.Room>>) {
        this._homeDB.ReadAll(Home.DB.ROOM, callback);
    }


    /**
     * ルーム情報の書込み
     * @param room 
     * @param callback 
     */
    public UpdateRoom(room: Home.Room, callback: OnWrite = null) {
        this._homeDB.Write<Home.Room>(Home.DB.ROOM, room.hid, room, callback);
    }


    /**
     * ルーム情報の削除
     * @param room 
     * @param callback 
     */
    public DeleteRoom(room: Home.Room, callback: OnWrite = null) {
        this._homeDB.Delete<Home.Room>(Home.DB.ROOM, room.hid, callback);
    }

}
