import Sender from "../../Base/Container/Sender";

/**
 * プライベート配信の設定要求
 */
export default class GetCastSettingSedner extends Sender {

    public static ID = "GetCastSetting";

    constructor() {
        super(GetCastSettingSedner.ID);
    }
    
}
