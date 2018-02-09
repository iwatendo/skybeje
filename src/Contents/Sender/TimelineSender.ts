import Sender from "../../Base/Container/Sender";
import * as Timeline from "../../Contents/IndexedDB/Timeline";


/**
 * タイムライン通知
 */
export default class TimelineSender extends Sender {

    public static ID = "Timeline";

    constructor() {
        super(TimelineSender.ID);

        this.msgs = new Array<Timeline.Message>();
    }

    msgs: Array<Timeline.Message>;
}