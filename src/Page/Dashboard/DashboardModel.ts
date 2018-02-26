import DBContainer from "../../Contents/IndexedDB/DBContainer";
import * as Personal from "../../Contents/IndexedDB/Personal";
import * as Home from "../../Contents/IndexedDB/Home";
import * as Friend from "../../Contents/IndexedDB/Friend";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite, OnPearRead } from "../../Base/AbstractServiceModel";

import DashboardController from "./DashboardController";
import LocalCache from "../../Contents/Cache/LocalCache";


export default class DashboardModel extends AbstractServiceModel<DashboardController> {


    private _dbc: DBContainer;

    public get PersonalDB() { return this._dbc.PersonalDB }
    public get HomeDB() { return this._dbc.HomeDB }
    public get FriendDB() { return this._dbc.FriendDB }
    public get TimelineDB() { return this._dbc.TimelineDB }


    /**
     * 
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
        this._dbc = new DBContainer();
        this._dbc.ConnectAll(() => {
            callback();
        });
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
        this.PersonalDB.Read(Personal.DB.GUIDE, gid, callback);
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

}
