
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";
import CastVisitorController from "./CastVisitorController";


export default class CastVisitorModel extends AbstractServiceModel<CastVisitorController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
