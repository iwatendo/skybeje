import StdUtil from "../Util/StdUtil";

export default abstract class Sender {

    constructor(type: string) {
        this.type = type;
        this.uid = StdUtil.UserID;
        this.key = StdUtil.OneTimeKey;
    }

    type: string;
    uid: string;
    key: string;

}