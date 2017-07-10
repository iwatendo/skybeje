
import AbstractServiceController from "../../Base/Common/AbstractServiceController";

import * as Personal from "../../Base/IndexedDB/Personal";

import ProfileModel from "./ProfileModel";
import ProfileView from "./ProfileView";


export default class ProfileController extends AbstractServiceController<ProfileView, ProfileModel> {

    public Actor: Personal.Actor;

    public SelectionIid: string;


    /**
     *
     */
    constructor(aid: string) {

        super();

        this.SelectionIid = this.GetOwnaerSelectionIcon();
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
     * アクターの変更通知
     */
    public ChangeActorNotify(aid: string) {

        let element = window.parent.document.getElementById('sbj-dashborad-change-actor') as HTMLInputElement;

        if (element) {
            element.value = aid;
            element.click();
        }
    }


    /**
     * 選択されているアイコンを取得する
     */
    public GetOwnaerSelectionIcon(): string {
        let element = window.parent.document.getElementById('sbj-profile-selection-icon') as HTMLInputElement;
        return (element ? element.value : "");
    }


    /**
     * アイコンの変更通知
     */
    public ChangeSelectionIconNotify(iid: string) {

        let element = window.parent.document.getElementById('sbj-profile-selection-icon') as HTMLInputElement;

        if (element) {
            element.value = iid;
            element.click();
        }
    }


    /**
     * クローズ通知
     * ※親ドキュメント側から閉じる
     */
    public CloseNotify(){
        let element = window.parent.document.getElementById('sbj-profile-do-close') as HTMLInputElement;

        if (element) {
            element.click();
        }
    }

};