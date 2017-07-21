import Database from "./Database";
import * as DBI from "./Database";


export class Data {
}

export class DB extends Database<Data> {

    public static NAME = "Friend";
    public static NOTE = "フレンド";
    public static Member: string = 'member';

    constructor() {
        super(DB.NAME);
        this.SetStoreList(DB.Member);
    }

    public GetName(): string { return DB.NAME; }
    public GetNote(): string { return DB.NOTE; }

    public ReadAllData(onload: DBI.OnLoadComplete<Data>) {

        let data = new Data();
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {
    }


    public IsImportMatch(preData: any): boolean {
        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

    }

}
