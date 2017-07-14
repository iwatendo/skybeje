import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";

import ProfileController from "../ProfileController";
import GuideDialogController from "../GuideDialogController";
import GuideListComponent from "./GuideListComponent";


/**
 * 
 */
export default class GuideListView {

    private _owner: ProfileController;
    private _element: HTMLElement;
    private _guides: Array<Personal.Guide>;

    /**
     * コンストラクタ
     * @param owner 
     * @param element 
     */
    public constructor(owner: ProfileController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;

        if (!this._owner.SelectionGid) {
            this._owner.SelectionGid = (owner.Actor.guideIds ? owner.Actor.guideIds[0] : "");
        }

        let addGuideElement = document.getElementById('sbj-profile-add-guide');
        let editGuideElement = document.getElementById('sbj-profile-edit-guide');
        let deleteGuideElement = document.getElementById('sbj-profile-delete-guide');

        addGuideElement.onclick = (e) => this.OnClickAddGuide(this);
        editGuideElement.onclick = (e) => this.OnClickEditGuide(this);
        deleteGuideElement.onclick = (e) => this.OnClickDeleteGuide(this);

        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {

        let actor = this._owner.Actor;

        this._owner.Model.GetGuideList(actor, (guides) => {
            let key = StdUtil.CreateUuid();
            this._guides = guides;
            this.Render();
        });
    }


    /**
     * 
     */
    public SelectionGuide(): Personal.Guide {
        let l = this._guides.filter(n => n.gid === this._owner.SelectionGid);
        return (l.length > 0 ? l[0] : null);
    }


    /**
     * 
     */
    public Render() {
        let key = StdUtil.CreateUuid();
        let gid = this._owner.SelectionGid;
        ReactDOM.render(<GuideListComponent key={key} controller={this._owner} view={this} guides={this._guides} selectGid={gid} />, this._element, () => {
        });
    }


    /**
     * アイコンの追加処理
     */
    public OnClickAddGuide(view: GuideListView) {
        GuideDialogController.Add((guide) => view.AddGuide(view, guide));
    }


    /**
     * アイコンの編集
     */
    public OnClickEditGuide(view: GuideListView) {
        let guide = view.SelectionGuide();
        if (guide) {
            GuideDialogController.Edit(guide, (r) => this.UpdateGuide(view, r));
        }
    }


    /**
     * アイコンの削除
     */
    public OnClickDeleteGuide(view: GuideListView) {
        let guide = view.SelectionGuide();
        if (guide) {
            GuideDialogController.Delete(guide, (r) => this.DeleteGuide(view, r));
        }
    }


    /**
     * アイコンの追加
     * @param view 
     * @param newGuide 
     */
    public AddGuide(view: GuideListView, newGuide: Personal.Guide) {

        let actor = this._owner.Actor;
        let controller = view._owner;

        //  ガイドデータ作成
        this._owner.Model.GetGuideList(actor, (guides) => {
            newGuide.gid = StdUtil.CreateUuid();
            newGuide.aid = actor.aid;
            newGuide.iid = (actor.iconIds.length > 0 ? actor.iconIds[0] : "");
            newGuide.order = Order.New(guides);
            //  ガイドデータ 
            controller.Model.UpdateGuide(newGuide, () => {

                //  プロフィールにガイド情報を追加して更新
                let actor = controller.Actor;

                if (!actor.guideIds) {
                    actor.guideIds = new Array<string>();
                }

                actor.guideIds.push(newGuide.gid);
                controller.Model.UpdateActor(actor, () => {
                    //  リストの再表示
                    this._owner.SelectionGid = newGuide.gid;
                    view.Refresh();
                })
            })
        });
    }


    /**
     * アイコンの更新
     * @param view 
     * @param guide 
     * @param imgRec 
     */
    public UpdateGuide(view: GuideListView, guide: Personal.Guide) {
        view._owner.Model.UpdateGuide(guide);
        view.Refresh();
    }


    /**
     * アイコン削除
     * @param view 
     * @param guide 
     */
    public DeleteGuide(view: GuideListView, guide: Personal.Guide) {

        let owner = view._owner;
        let actor = owner.Actor;

        actor.guideIds = actor.guideIds.filter((n) => n !== guide.gid);
        owner.Model.UpdateActor(actor);
        owner.Model.DeleteGuide(guide);

        this._owner.SelectionGid = "";
        view.Refresh();
    }

}