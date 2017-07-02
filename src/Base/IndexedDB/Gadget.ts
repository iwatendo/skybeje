import Database from "./Database";
import * as DBI from "./Database";


export class Item {
    gid: string;
}

export class Data {
    Items: Array<Item>;
}

export class DB extends Database<Data> {

    public static NAME = "Gadget";
    public static NOTE = "ガジェット";
    public static ITEM: string = 'item';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.ITEM);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();

        this.ReadAll<Item>(DB.ITEM, (result: Array<Item>) => {
        data.Items = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<Item>(DB.ITEM, (n) => n.iid, data.Items, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {
        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

    }

}
