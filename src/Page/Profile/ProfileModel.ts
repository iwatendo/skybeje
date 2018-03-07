
import * as Personal from "../../Contents/IndexedDB/Personal";

import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite, OnPearRead } from "../../Base/AbstractServiceModel";
import ProfileController from "./ProfileController";
import { Order } from "../../Base/Container/Order";


export default class ProfileModel extends AbstractServiceModel<ProfileController> {

    private _personalDB: Personal.DB;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {

        this._personalDB = new Personal.DB();

        this._personalDB.Connect(() => {
            callback();
        });
    }


    /** 
     * アクターとアイコンを同時更新する為のトランザクション生成
     */
    private CreateTransaction_ActorIcon(): IDBTransaction {
        let stores: string[] = [Personal.DB.ACTOR, Personal.DB.ICON];
        return this._personalDB.CreateTransaction(stores, 'readwrite');
    }


    /**
     * プロフィール情報取得
     * @param callback 
     */
    public GetUserProfile(callback: OnRead<Personal.Actor>) {

        this._personalDB.ReadAll(Personal.DB.ACTOR, (actors: Array<Personal.Actor>) => {

            let result: Personal.Actor;
            let list = actors.filter(n => n.isUserProfile);

            if (list && list.length > 0) {
                result = list[0];
            }

            callback(result);
        });
    }


    /**
     * プロフィール＋アイコンデータの取得
     * @param callback 
     */
    public GetUserProfileInfo(callback: OnPearRead<Personal.Actor, Array<Personal.Icon>>) {

        //
        this.GetUserProfile((profile) => {

            if (!profile) {
                profile = new Personal.Actor();
                profile.aid = StdUtil.CreateUuid();
                profile.isUserProfile = true;
                profile.order = 0;
            }

            this.GetIconList(profile, (icons) => {
                callback(profile, icons);
            });
        });
    }


    /**
     * アクター情報取得
     * @param aid
     * @param callback 
     */
    public GetActor(aid: string, callback: OnRead<Personal.Actor>) {
        this._personalDB.Read(Personal.DB.ACTOR, aid, callback);
    }


    /**
     * アクター情報一覧の取得
     * @param callback 
     */
    public GetActors(callback: OnRead<Array<Personal.Actor>>) {
        this._personalDB.ReadAll(Personal.DB.ACTOR, callback);
    }


    /**
     * アクター情報の更新
     * @param actor 
     * @param callback 
     */
    public UpdateActor(actor: Personal.Actor, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, callback);
    }


    /**
     * アクターとアイコンの更新
     * @param actor 
     * @param icons 
     * @param callback 
     */
    public UpdateActorIcon(actor: Personal.Actor, icons: Array<Personal.Icon>, callback: OnWrite = null) {

        let trnc = this.CreateTransaction_ActorIcon();

        this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, () => {
            this._personalDB.WriteAll(Personal.DB.ICON, (icon) => { return icon.iid }, icons, callback, trnc);
        }, trnc);
    }


    /**
     * 指定アクターのアイコンリストを取得します
     * @param actor 
     * @param callback 
     */
    public GetIconList(actor: Personal.Actor, callback: OnRead<Array<Personal.Icon>>) {

        if (actor === null) {
            return;
        }
        let result = new Array<Personal.Icon>();

        let trans = this._personalDB.CreateTransaction(Personal.DB.ICON, 'readonly');

        let icons = actor.iconIds;
        let loop: number = 0;
        let max: number = icons.length;

        let loopCall = (icon) => {
            result.push(icon);
            loop += 1;
            if (loop < max) {
                this._personalDB.Read(Personal.DB.ICON, icons[loop], (icon) => {
                    loopCall(icon);
                }, trans);
            }
            else {
                callback(result);
            }
        };

        if (max === 0) {
            callback(result);
        }
        else {
            this._personalDB.Read(Personal.DB.ICON, icons[0], (icon) => {
                loopCall(icon);
            }, trans);
        }
    }


    /**
     * アイコンの追加処理
     * @param actor
     * @param newIcon
     * @param callback
     */
    public UpdateActorAddIcon(actor: Personal.Actor, newIcon: Personal.Icon, callback: OnWrite = null) {

        //  アイコンデータ作成
        this.GetIconList(actor, (icons) => {

            newIcon.iid = StdUtil.CreateUuid();
            newIcon.order = Order.New(icons);
            let trans = this.CreateTransaction_ActorIcon();

            this._personalDB.Write<Personal.Icon>(Personal.DB.ICON, newIcon.iid, newIcon, () => {

                //  プロフィールにアイコン追加して更新
                actor.iconIds.push(newIcon.iid);
                actor.dispIid = newIcon.iid;

                //  プロフィール更新
                this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, () => {
                    callback();
                }, trans);
            }, trans);
        });
    }


    /**
     * アイコンの更新処理
     * キャッシュの問題もあるため、Iidを変更して別画像として更新する
     * @param view 
     * @param preIcon 
     * @param imgRec 
     */
    public UpdateActorChangeIcon(actor: Personal.Actor, preIcon: Personal.Icon, newIcon: Personal.Icon, callback: OnWrite = null) {

        //  アイコンデータ作成
        this.GetIconList(actor, (icons) => {

            newIcon.iid = StdUtil.CreateUuid();
            let trans = this.CreateTransaction_ActorIcon();

            this._personalDB.Write<Personal.Icon>(Personal.DB.ICON, newIcon.iid, newIcon, () => {

                //  アイコンデータの差替え
                icons = icons.filter(n => n.iid !== preIcon.iid);
                icons.push(newIcon);
                Order.Sort(icons);
                actor.iconIds = new Array<string>();
                icons.forEach((icon) => actor.iconIds.push(icon.iid));
                actor.dispIid = newIcon.iid;

                //  プロフィール更新
                this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, () => {
                    //  旧アイコンを削除
                    this._personalDB.Delete<Personal.Icon>(Personal.DB.ICON, preIcon.iid, () => {
                        callback();
                    }, trans);
                }, trans);
            }, trans);
        });
    }


    /**
     * アクターに付随するアイコンを削除
     * @param actor
     * @param delIcon 
     * @param callback 
     */
    public UpdateActorDeleteIcon(actor: Personal.Actor, delIcon: Personal.Icon, callback: OnWrite = null) {

        actor.iconIds = actor.iconIds.filter((n) => n !== delIcon.iid);
        if (actor.dispIid === delIcon.iid) {
            actor.dispIid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);
        }

        let trans = this.CreateTransaction_ActorIcon();

        //  プロフィール更新
        this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, () => {
            //  旧アイコンを削除
            this._personalDB.Delete<Personal.Icon>(Personal.DB.ICON, delIcon.iid, () => {
                callback();
            }, trans);
        }, trans);
    }


    /**
     * 指定アクターのガイドIDを取得します
     * @param actor 
     * @param callback 
     */
    public GetGuideList(actor: Personal.Actor, callback: OnRead<Array<Personal.Guide>>) {

        if (actor === null) {
            return;
        }
        let result = new Array<Personal.Guide>();

        let guides = actor.guideIds;
        let loop: number = 0;
        let max: number = (guides ? guides.length : 0);

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


    /**
     * ガイドの取得
     * @param iid 
     * @param callback 
     */
    public GetGuide(iid: string, callback: OnRead<Personal.Guide>) {
        this._personalDB.Read(Personal.DB.GUIDE, iid, callback);
    }


    /**
     * ガイドの更新
     * @param guide 
     * @param callback 
     */
    public UpdateGuide(guide: Personal.Guide, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Guide>(Personal.DB.GUIDE, guide.gid, guide, () => {
            if (callback) {
                callback();
            }
        });
    }


    /**
     * ガイドの削除
     * @param guide 
     * @param callback 
     */
    public DeleteGuide(guide: Personal.Guide, callback: OnWrite = null) {
        this._personalDB.Delete<Personal.Guide>(Personal.DB.GUIDE, guide.gid, callback);
    }


}
