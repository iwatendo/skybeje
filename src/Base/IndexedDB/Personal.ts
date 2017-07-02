﻿import Database from "./Database";
import * as DBI from "./Database";
import ImageInfo from "../Container/ImageInfo";
import { IOrder } from "../Container/Order";


/**
 * アクター情報（ユーザープロフィール情報）
 */
export class Actor implements IOrder {

    constructor() {
        this.aid = "";
        this.isUserProfile = false;
        this.name = "";
        this.tag = "";
        this.profile = "";
        this.iconIds = new Array<string>();
        this.order = 0;
    }

    aid: string;
    isUserProfile: boolean;
    name: string;
    tag: string;
    profile: string;
    iconIds: Array<string>;
    order: number;

    /**
     * 変更されたか？
     * @param pre 
     * @param cur 
     */
    public static IsChange(pre: Actor, cur: Actor) {
        return !(pre.name === cur.name && pre.tag === cur.tag && pre.profile === cur.profile);
    }
}

export class Icon implements IOrder {

    constructor() {
        this.iid = "";
        this.order = 0;
        this.img = new ImageInfo();
    }

    iid: string;
    order: number;
    img: ImageInfo;
}

export class Data {
    Actors: Array<Actor>;
    Icons: Array<Icon>;
}

export class DB extends Database<Data> {

    public static NAME = "Personal";
    public static NOTE = "プロフィール／アクター";
    public static ACTOR: string = 'actor';
    public static ICON: string = 'icon';


    /**
     * 
     */
    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.ACTOR);
        this.SetStoreList(DB.ICON);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }


    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<Actor>(DB.ACTOR, (result: Array<Actor>) => {
            data.Actors = result;
            this.ReadAll<Icon>(DB.ICON, (result: Array<Icon>) => {
                data.Icons = result;
                onload(data);
            });
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {
        this.WriteAll<Actor>(DB.ACTOR, (n) => n.aid, data.Actors, () => {
            this.WriteAll<Icon>(DB.ICON, (n) => n.iid, data.Icons, () => {
                callback();
            });
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.Actors && data.Actors.length > 0) return true;
        if (data.Icons && data.Icons.length > 0) return true;

        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.ACTOR, () => {
            this.ClearAll(DB.ICON, () => {
                this.WriteAllData(data, callback);
            });
        });

    }

}
