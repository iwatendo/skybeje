
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";
import CastInstanceMobileController from "./CastInstanceMobileController";


export default class CastInstanceMobileModel extends AbstractServiceModel<CastInstanceMobileController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
