
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import ImageUtil from "../../Base/Util/ImageUtil";
import IconListView from "./Icon/IconListView";
import GuideListView from "./Guide/GuideListView";
import ProfileController from "./ProfileController";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import MdlUtil from "../../Contents/Util/MdlUtil";


export default class ProfileView extends AbstractServiceView<ProfileController> {

    private _actor: Personal.Actor;
    private _iconListView: IconListView;
    private _guideListView: GuideListView;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        let isNew = this.Controller.IsNew;
        document.getElementById('sbj-profile-title').textContent = (isNew ? "アクターの追加" : "プロフィールを編集");
        document.getElementById('sbj-profile-append').hidden = !isNew;
        document.getElementById('sbj-profile-update').hidden = isNew;

        let actor = this.Controller.Actor;
        this.SetActorInfo(actor);

        if (actor.name) {
            document.getElementById('sbj-profile-name-field').classList.remove('is-invalid');
            document.getElementById('sbj-profile-name-field').classList.add('is-dirty');
        }
        if (actor.tag) document.getElementById('sbj-profile-tag-field').classList.add('is-dirty');
        if (actor.profile) document.getElementById('sbj-profile-note-field').classList.add('is-dirty');

        this.Resize();
        this.SetButtonDisabled();
        this.InitializeEvent();
        document.getElementById('sbj-profile-name').focus();

        MessageChannelUtil.SetChild(this.Controller, () => { });

        callback();
    }


    /**
     * 各種イベントの初期化
     */
    public InitializeEvent() {

        let controller = this.Controller;

        //  更新ボタン押下時
        document.getElementById('sbj-profile-append').onclick = (e) => { this.DoUpdate(this.Controller); }
        document.getElementById('sbj-profile-update').onclick = (e) => { this.DoUpdate(this.Controller); }

        //  ルーム名変更時
        document.getElementById('sbj-profile-name').oninput = (e) => { this.SetButtonDisabled(); }

        //  リサイズ時
        window.onresize = (e) => { this.Resize(); };

        //  キャンセルボタン押下時
        document.getElementById('sbj-profile-cancel').onclick = (e) => { this.DoCancel(); }
        document.getElementById('sbj-profile-dialog-close').onclick = (e) => { this.DoCancel(); };

        //  エリア外クリック
        document.getElementById('sbj-profile').onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                this.DoCancel();
            }
        };

        //  ESCキーでのクローズ
        document.onkeydown = (e) => {
            if (e.keyCode === 27) {
                this.DoCancel();
            }
        }

        //  外部からのドラッグ時
        document.getElementById("sbj-profile").addEventListener('dragover', (event: DragEvent) => {
            if (ImageUtil.IsImageDrag(event)) {
                this._iconListView.OnClickAddIcon(this._iconListView);
            }
        });

    }


    /**
     * アクター情報を画面にセット
     * @param room 
     */
    public SetActorInfo(actor: Personal.Actor) {
        (document.getElementById('sbj-profile-name') as HTMLInputElement).value = actor.name;
        (document.getElementById('sbj-profile-tag') as HTMLInputElement).value = actor.tag;
        (document.getElementById('sbj-profile-note') as HTMLInputElement).value = actor.profile;

        let isIconDispChange = Personal.Actor.IsIconDispChange(actor.actorType);
        MdlUtil.SetChecked('sbj-profile-caster', 'sbj-profile-caster-label', isIconDispChange);

        let isDispSubtitles = Personal.Actor.IsDispSubtitles(actor.actorType);
        MdlUtil.SetChecked('sbj-profile-narrator', 'sbj-profile-narrator-label', isDispSubtitles);

        this._iconListView = new IconListView(this.Controller, document.getElementById('sbj-profile-icons-list'));
        this._guideListView = new GuideListView(this.Controller, document.getElementById('sbj-profile-guides-list'))
    }


    /**
     * 
     */
    private SetButtonDisabled() {

        let isDisabled = ((document.getElementById('sbj-profile-name') as HTMLInputElement).value.length === 0);
        (document.getElementById('sbj-profile-append') as HTMLInputElement).disabled = isDisabled;
        (document.getElementById('sbj-profile-update') as HTMLInputElement).disabled = isDisabled;
    }


    /**
     * 
     */
    public Resize() {

        let height = window.innerHeight - 64;

        if (height < 540) height = 540;

        let marginTop = (Math.round(height / 2)) * -1;

        let mainElement = document.getElementById('sbj-profile-layout') as HTMLElement;
        let contentElement = document.getElementById('sbj-profile-layout_content') as HTMLElement;

        mainElement.style.height = height.toString() + "px";
        contentElement.style.height = (height - 355).toString() + "px";

    }


    /**
     * アイコンのダブルクリック時
     */
    public IconDoubleClick() {

        //  アイコンのダブルクリックで確定するパターンの処理も残しておく
        let isIconChangeMode = false;

        if (isIconChangeMode) {
            this.DoUpdate(this.Controller);
        }
        else {
            this._iconListView.OnClickEditIcon(this._iconListView);
        }
    }


    /**
     * 
     */
    private GetActorType(): Personal.ActorType {
        let actorTypeElement1 = document.getElementById('sbj-profile-caster') as HTMLInputElement;
        let actorTypeElement2 = document.getElementById('sbj-profile-narrator') as HTMLInputElement;

        if (actorTypeElement1.checked) {
            if (actorTypeElement2.checked) {
                return Personal.ActorType.CastNarrator;
            }
            else {
                return Personal.ActorType.Caster;
            }
        }
        else {
            if (actorTypeElement2.checked) {
                return Personal.ActorType.Narrator;
            }
            else {
                return Personal.ActorType.Default;
            }
        }

    }


    /**
     * アクターデータの更新
     * @param controller 
     */
    public DoUpdate(controller: ProfileController) {

        let actor = controller.Actor;
        actor.name = (document.getElementById('sbj-profile-name') as HTMLInputElement).value;
        actor.tag = (document.getElementById('sbj-profile-tag') as HTMLInputElement).value;
        actor.profile = (document.getElementById('sbj-profile-note') as HTMLInputElement).value;
        actor.actorType = this.GetActorType();

        controller.Model.UpdateActor(actor, () => {
            controller.PostChangeClose(actor.aid);
        });
    }


    /**
     * キャンセル時の動作
     */
    public DoCancel() {

        let controller = this.Controller;
        let actor = controller.Actor;

        if (controller.IsNew) {
            //  アクターの新規追加で、アイコンorガイド登録された場合
            //  キャンセルされてもアクター登録を行う
            if (actor.iconIds.length > 0 || actor.guideIds.length > 0) {
                actor.name = "名称未設定";
                controller.Model.UpdateActor(actor, () => {
                    controller.PostChangeClose(actor.aid);
                });
            }
            else {
                this.Controller.PostChangeClose("");
            }
        }
        else {
            //  アクター情報の更新がキャンセルされた場合でも
            //  チャット側ではアクター情報を取得しなおす
            if (actor && actor.aid) {
                this.Controller.PostChangeClose(actor.aid);
            }
            else {
                this.Controller.PostChangeClose("");
            }
        }
    }

}
