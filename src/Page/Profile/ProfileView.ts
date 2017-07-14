
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import ProfileController from "./ProfileController";
import IconListView from "./Icon/IconListView";
import ImageUtil from "../../Base/Util/ImageUtil";
import GuideListView from "./Guide/GuideListView";


export default class ProfileView extends AbstractServiceView<ProfileController> {

    private _actor: Personal.Actor;
    private _iconListView: IconListView;
    private _guideListView: GuideListView;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        let controller = this.Controller;
        let actor = controller.Actor;
        let backpanel = document.getElementById('sbj-profile');
        let cancelButton = document.getElementById('sbj-profile-cancel');
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

        this._iconListView = new IconListView(controller, document.getElementById('sbj-profile-icons-list'));
        this._guideListView = new GuideListView(controller, document.getElementById('sbj-profile-guides-list'))

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                controller.CloseNotify();
            }
        };

        window.onresize = (e) => {
            this.Resize();
        };

        //  キャンセルボタン押下時
        cancelButton.onclick = (e) => {
            controller.CloseNotify();
        };

        //  外部からのドラッグイベント時
        document.getElementById("sbj-profile").addEventListener('dragover', (event: DragEvent) => {

            //  ドラッグされた内容によって処理を分ける
            if (ImageUtil.IsImageDrag(event)) {
                this._iconListView.OnClickAddIcon(this._iconListView);
            }

        });

        this.Resize();
        callback();
    }


    public Resize() {

        let height = window.innerHeight - 160;

        if (height < 540) height = 540;
        if (height > 720) height = 720;

        let marginTop = (Math.round(height / 2)) * -1;

        let mainpanel = document.getElementById('sbj-profile-layout') as HTMLElement;
        mainpanel.style.height = height.toString() + "px";
        mainpanel.style.margin = marginTop.toString() + "px 0 0 -480px";
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
