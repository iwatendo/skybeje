
import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";

import CastInstanceControllerRasPi from "./CastInstanceRasPiController";


export default class CastInstanceModelRasPi extends AbstractServiceModel<CastInstanceControllerRasPi> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
    }

}
