import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import ImageInfo from "../../../Base/Container/ImageInfo";
import ImageUtil from "../../../Base/Util/ImageUtil";

import ImageDialogController from "../../Dashboard/ImageDialogController";
import IconListComponent from "./IconListComponent";
import ProfileController from "../ProfileController";


/**
 * 
 */
export default class IconListView {

    private _owner: ProfileController;
    private _element: HTMLElement;
    private _icons: Array<Personal.Icon>;

    /**
     * コンストラクタ
     * @param owner 
     * @param element 
     */
    public constructor(owner: ProfileController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;

        if (!this._owner.SelectionIid) {
            this._owner.SelectionIid = (owner.Actor.iconIds ? owner.Actor.iconIds[0] : "");
        }

        let addIconElement = document.getElementById('sbj-profile-add-icon');
        let editIconElement = document.getElementById('sbj-profile-edit-icon');
        let deleteIconElement = document.getElementById('sbj-profile-delete-icon');

        addIconElement.onclick = (e) => this.OnClickAddIcon(this);
        editIconElement.onclick = (e) => this.OnClickEditIcon(this);
        deleteIconElement.onclick = (e) => this.OnClickDeleteIcon(this);

        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {

        let actor = this._owner.Actor;

        this._owner.Model.GetIconList(actor, (icons) => {
            let key = StdUtil.CreateUuid();
            this._icons = icons;
            this.Render();
        });
    }


    /**
     * 
     */
    public SelectionIcon(): Personal.Icon {
        let l = this._icons.filter(n => n.iid === this._owner.SelectionIid);
        return (l.length > 0 ? l[0] : null);
    }


    /**
     * 
     */
    public Render() {
        let key = StdUtil.CreateUuid();
        let iid = this._owner.SelectionIid;
        ReactDOM.render(<IconListComponent key={key} controller={this._owner} icons={this._icons} selectIid={iid} />, this._element, () => {
            this._icons.map((icon) => {
                ImageInfo.SetCss(icon.iid, icon.img);
            });
        });
    }


    /**
     * アイコンの追加処理
     */
    public OnClickAddIcon(view: IconListView) {
        ImageDialogController.Add((img) => view.AddIcon(view, img));
    }


    /**
     * アイコンの編集
     */
    public OnClickEditIcon(view: IconListView) {
        let icon = view.SelectionIcon();
        if (icon) {
            ImageDialogController.Edit(icon.img, (img) => this.UpdateIcon(view, icon, img));
        }
    }


    /**
     * アイコンの削除
     */
    public OnClickDeleteIcon(view: IconListView) {
        let icon = view.SelectionIcon();
        if (icon) {
            ImageDialogController.Delete(icon.img, (img) => this.DeleteIcon(view, icon, img));
        }
    }


    /**
     * アイコンの追加
     * @param view 
     * @param imgRec 
     */
    public AddIcon(view: IconListView, imgRec: ImageInfo) {

        let actor = this._owner.Actor;
        let controller = view._owner;

        //  アイコンデータ作成
        this._owner.Model.GetIconList(actor, (icons) => {
            let icon = new Personal.Icon();
            icon.iid = StdUtil.CreateUuid();
            icon.order = Order.New(icons);
            icon.img = imgRec;
            controller.Model.UpdateIcon(icon, () => {

                //  プロフィールにアイコン追加して更新
                let actor = controller.Actor;
                actor.iconIds.push(icon.iid);
                controller.Model.UpdateActor(actor, () => {
                    //  リストの再表示
                    this._owner.SelectionIid = icon.iid;
                    view.Refresh();
                })
            })
        });
    }


    /**
     * アイコンの更新
     * @param view 
     * @param icon 
     * @param imgRec 
     */
    public UpdateIcon(view: IconListView, icon: Personal.Icon, imgRec: ImageInfo) {
        icon.img = imgRec;
        view._owner.Model.UpdateIcon(icon);
        view.Refresh();
    }


    /**
     * アイコン削除
     * @param view 
     * @param icon 
     * @param imgRec 
     */
    public DeleteIcon(view: IconListView, icon: Personal.Icon, imgRec: ImageInfo) {

        let owner = view._owner;
        let actor = owner.Actor;

        actor.iconIds = actor.iconIds.filter((n) => n !== icon.iid);
        owner.Model.UpdateActor(actor);
        owner.Model.DeleteIcon(icon);

        this._owner.SelectionIid = "";
        view.Refresh();
    }

}