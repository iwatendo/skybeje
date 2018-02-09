
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import CastInstanceScreenShareController from "./CastInstanceScreenShareController";


export default class CastInstanceScreenShareModel extends AbstractServiceModel<CastInstanceScreenShareController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
