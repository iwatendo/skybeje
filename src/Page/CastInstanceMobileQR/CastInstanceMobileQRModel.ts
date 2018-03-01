
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import CastInstanceMobileQRController from "./CastInstanceMobileQRController";


export default class CastInstanceMobileQRModel extends AbstractServiceModel<CastInstanceMobileQRController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
