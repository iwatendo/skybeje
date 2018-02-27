
import AbstractServiceController from "../../Base/AbstractServiceController";
import UserSettingsModel from "./UserSettingsModel";
import UserSettingsView from "./UserSettingsView";


export default class UserSettingsController extends AbstractServiceController<UserSettingsView, UserSettingsModel> {

    public ControllerName(): string { return "UserSettings"; }

    /**
     * 
     */
    public constructor() {
        super();

        this.Model = new UserSettingsModel(this, () => {
            this.View = new UserSettingsView(this, () => {
            });
        });
    }

}
