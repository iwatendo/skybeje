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
        let l = this._icons.filter(n => n.iid === this._owner.Actor.dispIid);
        return (l.length > 0 ? l[0] : null);
    }


    /**
     * 
     */
    public Render() {
        let key = StdUtil.CreateUuid();
        let iid = (this._owner.Actor.dispIid ? this._owner.Actor.dispIid : "");
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

        let model = view._owner.Model;
        let actor = view._owner.Actor;

        //  アイコンデータ作成
        model.GetIconList(actor, (icons) => {

            let icon = new Personal.Icon();
            icon.iid = StdUtil.CreateUuid();
            icon.order = Order.New(icons);
            icon.img = imgRec;

            model.UpdateIcon(icon, () => {

                //  プロフィールにアイコン追加して更新
                actor.iconIds.push(icon.iid);
                actor.dispIid = icon.iid;

                model.UpdateActor(actor, () => {
                    view.Refresh();
                });
            });
        });
    }


    /**
     * アイコンの更新処理
     * キャッシュの問題もあるため、Iidを変更して別画像扱いとする
     * @param view 
     * @param preIcon 
     * @param imgRec 
     */
    public UpdateIcon(view: IconListView, preIcon: Personal.Icon, imgRec: ImageInfo) {

        let model = view._owner.Model;
        let actor = view._owner.Actor;

        let newIcon = Personal.Icon.Copy(preIcon);

        //  アイコンデータ作成
        model.GetIconList(actor, (icons) => {

            let newIcon = Personal.Icon.Copy(preIcon);
            newIcon.iid = StdUtil.CreateUuid();
            newIcon.img = imgRec;

            model.UpdateIcon(newIcon, () => {

                //  アイコンデータの差替え
                icons = icons.filter(n => n.iid !== preIcon.iid);
                icons.push(newIcon);
                Order.Sort(icons);
                actor.iconIds = new Array<string>();
                icons.forEach((icon) => actor.iconIds.push(icon.iid));
                actor.dispIid = newIcon.iid;

                //  プロフィール更新
                model.UpdateActor(actor, () => {
                    //  旧アイコンを削除
                    model.DeleteIcon(preIcon, () => {
                        view.Refresh();
                    });
                });
            });
        });
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
        if (actor.dispIid === icon.iid) {
            actor.dispIid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);
        }
        owner.Model.UpdateActor(actor);
        owner.Model.DeleteIcon(icon);

        view.Refresh();
    }

}