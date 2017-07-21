
import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";
import * as Friend from "../../Base/IndexedDB/Friend";
import * as Timeline from "../../Base/IndexedDB/Timeline";
import { OnModelLoad } from "../Common/AbstractServiceModel";

export default class DBContainer {

    public PersonalDB: Personal.DB;
    public HomeDB: Home.DB;
    public FriendDB: Friend.DB;
    public TimelineDB: Timeline.DB;

    /**
     * 
     */
    public constructor() {
        this.PersonalDB = new Personal.DB();
        this.HomeDB = new Home.DB();
        this.FriendDB = new Friend.DB();
        this.TimelineDB = new Timeline.DB();
    }


    /**
     * 初期化処理
     * @param callback 
     */
    public RemoveAll(callback: OnModelLoad) {

        this.PersonalDB.Remove(() => {
            this.HomeDB.Remove(() => {
                this.FriendDB.Remove(() => {
                    this.TimelineDB.Remove(() => {
                        callback();
                    });
                });
            });
        });
    }


    /**
     * IndexedDBへの接続
     * @param callback 
     * @param isBootInit 
     */
    public ConnectAll(callback: OnModelLoad) {

        this.PersonalDB.Connect(() => {
            this.HomeDB.Connect(() => {
                this.FriendDB.Connect(() => {
                    this.TimelineDB.Connect(() => {
                        callback();
                    });
                });
            });
        });
    }
}
