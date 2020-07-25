
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import VoiceChatController from "./VoiceChatController";

export default class VoiceChatModel extends AbstractServiceModel<VoiceChatController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
        callback();
    }

}
