import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";
import VoiceChatSettingsController from "./VoiceChatSettingsController";


export default class VoiceChatSettingsModel extends AbstractServiceModel<VoiceChatSettingsController> {

    /**
     * 
     * @param callback
     */
    protected Initialize(callback: OnModelLoad) {
        callback();
    }

}
