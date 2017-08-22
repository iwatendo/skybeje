
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/Common/AbstractServiceModel";

import GadgetInstanceController from "./GadgetInstanceController";


export default class GadgetInstanceModel extends AbstractServiceModel<GadgetInstanceController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
