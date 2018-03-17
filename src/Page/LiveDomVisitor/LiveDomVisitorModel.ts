
import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";
import LiveDomVisitorController from "./LiveDomVisitorController";


export default class LiveDomVisitorModel extends AbstractServiceModel<LiveDomVisitorController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
