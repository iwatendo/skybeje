import AbstractServiceController from "../../Base/AbstractServiceController";
import VoiceChatSettingsModel from "./VoiceChatSettingsModel";
import VoiceChatSettingsView from "./VoiceChatSettingsView";


export default class VoiceChatSettingsController extends AbstractServiceController<VoiceChatSettingsView, VoiceChatSettingsModel> {

    public ControllerName(): string { return "VoiceChatSettings"; }

    /**
     * 
     */
    public constructor() {
        super();

        this.Model = new VoiceChatSettingsModel(this, () => {
            this.View = new VoiceChatSettingsView(this, () => {
            });
        });
    }

}
