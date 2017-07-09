
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import ProfileController from "./ProfileController";
import IconListView from "./Icon/IconListView";
import ImageUtil from "../../Base/Util/ImageUtil";


export default class ProfileView extends AbstractServiceView<ProfileController> {

    private _actor: Personal.Actor;
    private _iconListView: IconListView;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        let controller = this.Controller;
        let actor = controller.Actor;
        let nameElement = document.getElementById('sbj-profile-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-profile-tag') as HTMLInputElement;
        let noteElement = document.getElementById('sbj-profile-note') as HTMLInputElement;

        nameElement.value = actor.name;
        tagElement.value = actor.tag;
        noteElement.value = actor.profile;

        if (actor.name) document.getElementById('sbj-profile-name-field').classList.add('is-dirty');
        if (actor.tag) document.getElementById('sbj-profile-tag-field').classList.add('is-dirty');
        if (actor.profile) document.getElementById('sbj-profile-note-field').classList.add('is-dirty');

        nameElement.onblur = (e) => this.CheckChangeUpdate(controller);
        tagElement.onblur = (e) => this.CheckChangeUpdate(controller);
        noteElement.onblur = (e) => this.CheckChangeUpdate(controller);

        let iconElement = document.getElementById('sbj-profile-icons-list');
        this._iconListView = new IconListView(controller, iconElement);

        //  外部からのドラッグイベント時
        document.getElementById("sbj-profile").addEventListener('dragover', (event: DragEvent) => {

            //  ドラッグされた内容によって処理を分ける
            if (ImageUtil.IsImageDrag(event)) {
                this._iconListView.OnClickAddIcon(this._iconListView);
            }

        });

        callback();
    }


    /**
     * 
     * @param controller 
     */
    private CheckChangeUpdate(controller: ProfileController) {

        let actor = controller.Actor;
        let nameElement = document.getElementById('sbj-profile-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-profile-tag') as HTMLInputElement;
        let noteElement = document.getElementById('sbj-profile-note') as HTMLInputElement;

        if (nameElement.value !== actor.name
            || tagElement.value !== actor.tag
            || noteElement.value !== actor.profile) {
            actor.name = nameElement.value;
            actor.tag = tagElement.value;
            actor.profile = noteElement.value;
            controller.Model.UpdateActor(actor);
            controller.ChangeActorNotify(actor.aid);
        }
    }

}
