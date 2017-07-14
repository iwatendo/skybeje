import DBContainer from "../../Base/IndexedDB/DBContainer";
import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";
import * as Gadget from "../../Base/IndexedDB/Gadget";
import * as Friend from "../../Base/IndexedDB/Friend";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import StdUtil from "../../Base/Util/StdUtil";
import LocalCache from "../../Base/Common/LocalCache";
import ImageInfo from "../../Base/Container/ImageInfo";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite, OnRead2 } from "../../Base/Common/AbstractServiceModel";

import DashboardController from "./DashboardController";


export default class DashboardModel extends AbstractServiceModel<DashboardController> {


    private _dbc: DBContainer;

    public get PersonalDB() { return this._dbc.PersonalDB }
    public get HomeDB() { return this._dbc.HomeDB }
    public get GadgetDB() { return this._dbc.GadgetDB }
    public get FriendDB() { return this._dbc.FriendDB }
    public get TimelineDB() { return this._dbc.TimelineDB }


    /**
     * 
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
        this._dbc = new DBContainer();

        if (LocalCache.InitializedSkybeje) {
            //  通常起動
            this._dbc.ConnectAll(() => {
                callback();
            });
        }
        else {
            //  初期データをセットして起動
            this._dbc.RemoveAll(() => {
                this._dbc.ConnectAll(() => {
                    this.CreateDefaultData(callback);
                });
                LocalCache.InitializedSkybeje = true;
            });
        }
    }


    /**
     * エントランス情報の取得
     * @param hid 
     * @param callback 
     */
    public GetEntrance(hid: string, callback: OnRead<Home.Room>) {
        this.HomeDB.Read(Home.DB.ENTRANCE, hid, callback);
    }


    /**
     * エントランスリストの取得
     * @param callback 
     */
    public GetEntrances(callback: OnRead<Array<Home.Room>>) {
        this.HomeDB.ReadAll(Home.DB.ENTRANCE, callback);
    }


    /**
     * エントランス情報の書込み
     * @param entrance 
     * @param callback 
     */
    public UpdateEntrance(entrance: Home.Room, callback: OnWrite = null) {
        this.HomeDB.Write<Home.Room>(Home.DB.ENTRANCE, entrance.hid, entrance, callback);
    }


    /**
     * エントランス情報の削除
     * @param entrance 
     * @param callback 
     */
    public DeleteEntrance(entrance: Home.Room, callback: OnWrite = null) {
        this.HomeDB.Delete<Home.Room>(Home.DB.ENTRANCE, entrance.hid, callback);
    }


    /**
     * ルームリストの取得
     * @param hid 
     * @param callback 
     */
    public GetRooms(callback: OnRead<Array<Home.Room>>) {
        this.HomeDB.ReadAll(Home.DB.ROOM, callback);
    }


    /**
     * ルーム情報の書込み
     * @param room 
     * @param callback 
     */
    public UpdateRoom(room: Home.Room, callback: OnWrite = null) {
        this.HomeDB.Write<Home.Room>(Home.DB.ROOM, room.hid, room, callback);
        this.Controller.ChangeRoomNotify();
    }


    /**
     * ルーム情報の削除
     * @param room 
     * @param callback 
     */
    public DeleteRoom(room: Home.Room, callback: OnWrite = null) {
        this.HomeDB.Delete<Home.Room>(Home.DB.ROOM, room.hid, callback);
        this.Controller.ChangeRoomNotify();
    }



    /**
     * プロフィール情報取得
     * @param callback 
     */
    public GetUserProfile(callback: OnRead<Personal.Actor>) {

        this.PersonalDB.ReadAll(Personal.DB.ACTOR, (actors: Array<Personal.Actor>) => {

            let result: Personal.Actor;
            let list = actors.filter(n => n.isUserProfile);

            if (list && list.length > 0) {
                result = list[0];
            }

            callback(result);
        });
    }


    /**
     * アクターの取得
     * @param aid 
     * @param callback 
     */
    public GetActor(aid: string, callback: OnRead<Personal.Actor>) {
        this.PersonalDB.Read(Personal.DB.ACTOR, aid, callback);
    }


    /**
     * アクターの一覧取得
     * @param callback 
     */
    public GetActors(callback: OnRead<Array<Personal.Actor>>) {
        this.PersonalDB.ReadAll(Personal.DB.ACTOR, callback);
    }


    /**
     * アクター情報の更新
     * @param actor 
     */
    public UpdateActor(actor: Personal.Actor, callback: OnWrite = null) {
        this.PersonalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, callback);
        this.Controller.ChangeActorNotify(actor.aid);
    }


    /**
     * アクターの削除（付随データも削除します）
     * @param actor 
     */
    public DeleteActor(actor: Personal.Actor, callback: OnWrite = null) {

        this.PersonalDB.Delete<Personal.Actor>(Personal.DB.ACTOR, actor.aid, () => {

            //  削除されたアクターが保持するアイコンも削除
            this.GetIconList(actor, (icons) => {
                icons.map(icon => {
                    this.DeleteIcon(icon);
                });
            });

            //  削除されたアクターが保持するガイド情報も削除
            this.GetGuideList(actor, (guides) => {
                guides.map(guide => {
                    this.DeleteGuide(guide);
                });
            });
        });

    }


    /**
     * 指定されたAIDのアイコンリストを取得します
     * @param pid 
     * @param OnRead 
     */
    public GetIconList(actor: Personal.Actor, callback: OnRead<Array<Personal.Icon>>) {

        if (actor === null) {
            return;
        }
        let result = new Array<Personal.Icon>();

        let icons = actor.iconIds;
        let loop: number = 0;
        let max: number = icons.length;

        let loopCall = (icon) => {
            result.push(icon);
            loop += 1;
            if (loop < max) {
                this.GetIcon(icons[loop], loopCall);
            }
            else {
                callback(result);
            }
        };

        if (max === 0) {
            callback(result);
        }
        else {
            this.GetIcon(icons[0], loopCall)
        }
    }


    /**
     * アイコンの取得
     * @param iid 
     * @param callback 
     */
    public GetIcon(iid: string, callback: OnRead<Personal.Icon>) {
        this.PersonalDB.Read(Personal.DB.ICON, iid, callback);
    }


    /**
     * アイコンの更新
     * @param icon 
     * @param callback 
     */
    public UpdateIcon(icon: Personal.Icon, callback: OnWrite = null) {
        this.PersonalDB.Write<Personal.Icon>(Personal.DB.ICON, icon.iid, icon, () => {
            if (callback) {
                callback();
            }
            ImageInfo.SetCss(icon.iid, icon.img);
        });
    }


    /**
     * アイコンの削除
     * @param icon 
     * @param callback 
     */
    public DeleteIcon(icon: Personal.Icon, callback: OnWrite = null) {
        this.PersonalDB.Delete<Personal.Icon>(Personal.DB.ICON, icon.iid, callback);
    }


    /**
     * ガイド情報の取得
     * @param gid 
     * @param callback 
     */
    public GetGuide(gid: string, callback: OnRead<Personal.Guide>) {
        this.PersonalDB.Read(Personal.DB.ICON, gid, callback);
    }


    /**
     * ガイドの削除
     * @param guide 
     * @param callback 
     */
    public DeleteGuide(guide: Personal.Guide, callback: OnWrite = null) {
        this.PersonalDB.Delete<Personal.Guide>(Personal.DB.GUIDE, guide.gid, callback);
    }


    /**
     * 指定アクターが保持するガイド一覧を取得します
     * @param actor 
     * @param callback 
     */
    public GetGuideList(actor: Personal.Actor, callback: OnRead<Array<Personal.Guide>>) {

        if (actor === null) {
            return;
        }

        let result = new Array<Personal.Guide>();

        let guides = actor.guideIds;

        if (guides) {

            let loop: number = 0;
            let max: number = guides.length;

            let loopCall = (guide) => {
                result.push(guide);
                loop += 1;
                if (loop < max) {
                    this.GetGuide(guides[loop], loopCall);
                }
                else {
                    callback(result);
                }
            };

            if (max === 0) {
                callback(result);
            }
            else {
                this.GetGuide(guides[0], loopCall)
            }
        }
        else {
            callback(result);
        }
    }


    /**
     * 
     */
    public CreateDefaultData(callback: OnWrite) {

        //  デフォルトアイコン
        let icon = new Personal.Icon;
        icon.iid = StdUtil.CreateUuid();
        icon.img = new ImageInfo();
        icon.img.src = "/image/default-icon.png";

        //  デフォルトユーザー
        let guest = new Personal.Actor();
        guest.name = "名前未設定";
        guest.tag = "";
        guest.aid = StdUtil.CreateUuid();
        guest.isUserProfile = true;
        guest.profile = "";
        guest.iconIds.push(icon.iid);

        //  招待状
        let entrance = new Home.Room();
        entrance.name = "Skybejeにようこそ";
        entrance.hid = StdUtil.CreateUuid();
        entrance.order = 1;
        entrance.tag = "お試しルーム";
        entrance.text = "SkybejeはNTTCommunicationのSkywayを使用した\n新しい形のリアルタイムコミュニケーションサービスです。";
        entrance.isDefault = true;
        entrance.background = new ImageInfo();
        entrance.background.src = "/image/default-entrance.jpg";

        //
        let room1 = new Home.Room();
        room1.name = "デフォルトルーム";
        room1.hid = StdUtil.CreateUuid();
        room1.order = 1;
        room1.tag = "ユーザーが最初に配置される部屋";
        room1.text = "";
        room1.isDefault = true;
        room1.background = new ImageInfo();
        room1.background.src = "/image/default-room1.jpg";

        //  
        let room2 = new Home.Room();
        room2.name = "リビングルーム";
        room2.hid = StdUtil.CreateUuid();
        room2.order = 2;
        room2.tag = "オーナーの操作で入れる部屋";
        room2.text = "";
        room2.isDefault = false;
        room2.background = new ImageInfo();
        room2.background.src = "/image/default-room2.jpg";

        this.UpdateActor(guest, () => {
            this.UpdateIcon(icon, () => {
                this.UpdateEntrance(entrance, () => {
                    this.UpdateRoom(room1, () => {
                        this.UpdateRoom(room2, () => {
                            callback();
                            LocalCache.InitializedSkybeje = true;
                        });
                    });
                });
            });
        });
    }


}
