import StdUtil from "../Util/StdUtil";

export default abstract class Sender {

    constructor(type: string) {
        this.uid = StdUtil.UserID;
        this.type = type;
    }

    uid: string;
    type: string;

}