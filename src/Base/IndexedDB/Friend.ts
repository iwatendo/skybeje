import Database from "./Database";
import * as DBI from "./Database";


export class Member {
    mid: string;
}

export class Data {
    Members: Array<Member>;
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

        this.ReadAll<Member>(DB.Member, (result: Array<Member>) => {
        data.Members = result;
            onload(data);
        });
    }

    public WriteAllData(data: Data, callback: DBI.OnWriteComplete) {

        this.WriteAll<Member>(DB.Member, (n) => n.mid, data.Members, () => {
            callback();
        });
    }


    public IsImportMatch(preData: any): boolean {
        return false;
    }


    public Import(data: Data, callback: DBI.OnWriteComplete) {

    }

}
