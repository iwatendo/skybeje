
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
        let closelButton = document.getElementById('sbj-profile-dialog-close');
        let cancelButton = document.getElementById('sbj-profile-cancel');
        let nameElement = document.getElementById('sbj-profile-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-profile-tag') as HTMLInputElement;
        let noteElement = document.getElementById('sbj-profile-note') as HTMLInputElement;
        let updateButton = document.getElementById('sbj-profile-update') as HTMLInputElement;

        nameElement.value = actor.name;
        nameElement.oninput = (e) => {
            updateButton.disabled = (nameElement.value.length === 0);
        }
        tagElement.value = actor.tag;
        noteElement.value = actor.profile;
        updateButton.disabled = (nameElement.value.length === 0);

        if (actor.name) {
            document.getElementById('sbj-profile-name-field').classList.remove('is-invalid');
            document.getElementById('sbj-profile-name-field').classList.add('is-dirty');
        }
        if (actor.tag) document.getElementById('sbj-profile-tag-field').classList.add('is-dirty');
        if (actor.profile) document.getElementById('sbj-profile-note-field').classList.add('is-dirty');

        //
        updateButton.onclick = (e) => {
            this.UpdateActor(controller);
        }

        this._iconListView = new IconListView(controller, document.getElementById('sbj-profile-icons-list'));
        this._guideListView = new GuideListView(controller, document.getElementById('sbj-profile-guides-list'))

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                this.DoCancel();
            }
        };

        window.onresize = (e) => {
            this.Resize();
        };

        //  キャンセルボタン押下時
        closelButton.onclick = (e) => { this.DoCancel(); };
        cancelButton.onclick = (e) => { this.DoCancel(); };

        //  外部からのドラッグイベント時
        document.getElementById("sbj-profile").addEventListener('dragover', (event: DragEvent) => {

            //  ドラッグされた内容によって処理を分ける
            if (ImageUtil.IsImageDrag(event)) {
                this._iconListView.OnClickAddIcon(this._iconListView);
            }

        });

        //  キー入力時イベント
        document.onkeydown = (e) => {
            //  エスケープキーはダイアログを閉じる
            if (e.keyCode === 27) {
                this.DoCancel();
            }
        }

        this.Resize();

        nameElement.focus();
        callback();
    }


    /**
     * 
     */
    public Resize() {

        let height = window.innerHeight - 228;

        if (height < 540) height = 540;
        if (height > 720) height = 720;

        let marginTop = (Math.round(height / 2)) * -1;

        let mainElement = document.getElementById('sbj-profile-layout') as HTMLElement;
        let contentElement = document.getElementById('sbj-profile-layout_content') as HTMLElement;

        mainElement.style.height = height.toString() + "px";
        mainElement.style.margin = marginTop.toString() + "px 0 0 -480px";

        contentElement.style.height = (height - 355).toString() + "px";

    }


    /**
     * アイコンのダブルクリック時
     */
    public IconDoubleClick() {
        //  アイコンダブルクリック時の動作については
        //  設定で変更できるようにするか検討
        this.UpdateActor(this.Controller);
    }


    /**
     * アクターデータの更新
     * @param controller 
     */
    public UpdateActor(controller: ProfileController) {

        let actor = controller.Actor;
        let nameElement = document.getElementById('sbj-profile-name') as HTMLInputElement;
        let tagElement = document.getElementById('sbj-profile-tag') as HTMLInputElement;
        let noteElement = document.getElementById('sbj-profile-note') as HTMLInputElement;

        actor.name = nameElement.value;
        actor.tag = tagElement.value;
        actor.profile = noteElement.value;
        controller.Model.UpdateActor(actor, () => {
            controller.ChangeActorNotify(actor.aid);
            controller.CloseNotify();
        });
    }

    /**
     * キャンセル時の動作
     */
    public DoCancel() {

        let controller = this.Controller;

        if (controller.IsNew) {
            let actor = controller.Actor;
            if (actor.iconIds.length > 0 || actor.guideIds.length > 0) {
                actor.name = "（名称未設定）";
                controller.Model.UpdateActor(actor, () => {
                    controller.ChangeActorNotify(actor.aid);
                    controller.CloseNotify();
                });
            }
        }

        this.Controller.CloseNotify();
    }

}
