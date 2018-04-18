
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";

import VoiceChatController from "./VoiceChatController";
import StdUtil from "../../Base/Util/StdUtil";
import ImageInfo from "../../Base/Container/ImageInfo";
import LocalCache from "../../Contents/Cache/LocalCache";


export default class VoiceChatModel extends AbstractServiceModel<VoiceChatController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
        callback();
    }

}
