
import AbstractServiceController from "../../Base/Common/AbstractServiceController";

import ProfileModel from "./ProfileModel";
import ProfileView from "./ProfileView";


export default class ProfileController extends AbstractServiceController<ProfileView, ProfileModel> {

    /**
     *
     */
    constructor(aid: number) {
        super();
        this.Model = new ProfileModel(this, () => {
            this.View = new ProfileView(this, () => {
            });
        });
    };

};
