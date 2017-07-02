﻿import Database from "./Database";
import * as DBI from "./Database";
import ImageInfo from "../Container/ImageInfo";
import { IOrder } from "../Container/Order";


export class Room implements IOrder {
    hid: string;
    name: string;
    tag: string;
    text: string;
    isDefault: boolean;
    order: number;
    background: ImageInfo;
}


export class Data {
    Entrance: Array<Room>;
    Rooms: Array<Room>;
}


export class DB extends Database<Data> {

    public static NAME = "Home";
    public static NOTE = "招待状／ルーム";
    public static ENTRANCE: string = 'entrance';
    public static ROOM: string = 'room';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.ENTRANCE);
        this.SetStoreList(DB.ROOM);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<Room>(DB.ENTRANCE, (result: Array<Room>) => {
            data.Entrance = result;
            this.ReadAll<Room>(DB.ROOM, (result: Array<Room>) => {
                data.Rooms = result;
                onload(data);
            });
        });
    }


    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {
        this.WriteAll<Room>(DB.ENTRANCE, (n) => n.hid, data.Entrance, () => {
            this.WriteAll<Room>(DB.ROOM, (n) => n.hid, data.Rooms, () => {
                callback();
            });
        });
    }


    public IsImportMatch(preData: any): boolean {

        let data: Data = preData;
        if (data.Entrance && data.Entrance.length > 0) return true;
        if (data.Rooms && data.Rooms.length > 0) return true;

        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

        this.ClearAll(DB.ENTRANCE, () => {
            this.ClearAll(DB.ROOM, () => {
                this.WriteAllData(data, callback);
            });
        });

    }

}
