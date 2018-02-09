import LocalCache from "../../Contents/Cache/LocalCache";

export default abstract class Sender {

    public static Uid: string = LocalCache.UserID;

    constructor(type: string) {
        this.type = type;
        this.uid = Sender.Uid;
    }
    type: string;
    uid: string;

}