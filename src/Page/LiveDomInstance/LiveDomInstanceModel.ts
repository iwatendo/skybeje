
import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";

import LiveDomInstanceController from "./LiveDomInstanceController";


export default class LiveDomInstanceModel extends AbstractServiceModel<LiveDomInstanceController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
