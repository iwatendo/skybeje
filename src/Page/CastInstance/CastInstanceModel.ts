
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import CastInstanceController from "./CastInstanceController";


export default class CastInstanceModel extends AbstractServiceModel<CastInstanceController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
