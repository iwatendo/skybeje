import Sender from "../../Base/Container/Sender";

/**
 * ライブキャストの設定通知
 */
export default class CastSettingSender extends Sender {

    public static ID = "CastSetting";

    constructor() {
        super(CastSettingSender.ID);
        this.dispUserCursor = false;
        this.dispSubtitles = false;
    }
    dispSubtitles: boolean;
    dispUserCursor: boolean;
}
