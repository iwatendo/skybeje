
import * as Personal from "../../Base/IndexedDB/Personal";

import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite, OnRead2 } from "../../Base/Common/AbstractServiceModel";
import ProfileController from "./ProfileController";


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
    public GetUserProfileInfo(callback: OnRead2<Personal.Actor, Array<Personal.Icon>>) {

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
     * @param callback 
     */
    public GetActor(aid: string, callback: OnRead<Personal.Actor>) {
        this._personalDB.Read(Personal.DB.ACTOR, aid, callback);
    }


    /**
     * アクター情報の更新
     * @param actor 
     */
    public UpdateActor(actor: Personal.Actor, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Actor>(Personal.DB.ACTOR, actor.aid, actor, callback);
        this.Controller.ChangeActorNotify(actor.aid);
    }


    /**
     * アクターの削除（付随するアイコンも削除）
     * @param actor 
     */
    public DeleteActorIcon(actor: Personal.Actor, callback: OnWrite = null) {

        this._personalDB.Delete<Personal.Actor>(Personal.DB.ACTOR, actor.aid, () => {

            //  削除されたアクターが保持するアイコンも削除
            this.GetIconList(actor, (icons) => {
                icons.map(icon => {
                    this.DeleteIcon(icon);
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
        this._personalDB.Read(Personal.DB.ICON, iid, callback);
    }


    /**
     * アイコンの更新
     * @param icon 
     * @param callback 
     */
    public UpdateIcon(icon: Personal.Icon, callback: OnWrite = null) {
        this._personalDB.Write<Personal.Icon>(Personal.DB.ICON, icon.iid, icon, () => {
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
        this._personalDB.Delete<Personal.Icon>(Personal.DB.ICON, icon.iid, callback);
    }

}
