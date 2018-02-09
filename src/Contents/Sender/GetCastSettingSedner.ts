import Sender from "../../Base/Container/Sender";

/**
 * ライブキャストの設定要求
 */
export default class GetCastSettingSedner extends Sender {

    public static ID = "GetCastInfo";

    constructor() {
        super(GetCastSettingSedner.ID);
    }
    
}
