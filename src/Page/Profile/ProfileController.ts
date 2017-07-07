
import AbstractServiceController from "../../Base/Common/AbstractServiceController";

import * as Personal from "../../Base/IndexedDB/Personal";

import ProfileModel from "./ProfileModel";
import ProfileView from "./ProfileView";


export default class ProfileController extends AbstractServiceController<ProfileView, ProfileModel> {

    public Actor: Personal.Actor;

    /**
     *
     */
    constructor(aid: string) {

        super();

        let self = this;

        self.Model = new ProfileModel(self, () => {
            self.Model.GetActor(aid, (actor) => {
                self.Actor = actor;
                self.View = new ProfileView(self, () => {
                });
            });
        });

    };


    /**
     * クライアントが起動していた場合に
     * アクターが変更があった事を通知する
     */
    public ChangeActorNotify(aid: string) {

        let frame = window.parent.document.getElementById('sbj-main-home-visitor-frame') as HTMLFrameElement;

        if (!frame) {
            return;
        }

        //  ホームインスタンス側のエレメント
        let document = frame.contentDocument;
        let element = document.getElementById("sbj-dashborad-change-actor") as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }

};
