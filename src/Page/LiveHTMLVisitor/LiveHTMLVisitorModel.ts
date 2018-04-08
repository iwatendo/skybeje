
import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";
import LiveHTMLVisitorController from "./LiveHTMLVisitorController";


export default class LiveHTMLVisitorModel extends AbstractServiceModel<LiveHTMLVisitorController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
