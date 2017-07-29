
export default abstract class Sender {

    public static Uid: string;

    constructor(type: string) {
        this.type = type;
        this.uid = Sender.Uid;
    }
    type: string;
    uid: string;

}