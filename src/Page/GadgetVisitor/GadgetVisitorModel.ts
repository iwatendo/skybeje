
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/Common/AbstractServiceModel";
import GadgetVisitorController from "./GadgetVisitorController";


export default class GadgetVisitorModel extends AbstractServiceModel<GadgetVisitorController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
