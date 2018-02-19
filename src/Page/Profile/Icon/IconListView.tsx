﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Order } from "../../../Base/Container/Order";
import ImageInfo from "../../../Base/Container/ImageInfo";
import StdUtil from "../../../Base/Util/StdUtil";
import ImageUtil from "../../../Base/Util/ImageUtil";

import * as Personal from "../../../Contents/IndexedDB/Personal";

import IconListComponent from "./IconListComponent";
import ProfileController from "../ProfileController";
import IconDialogController from './IconDialogController';
import { Icon } from '../../../Contents/IndexedDB/Personal';


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
        let voicecodeElement = document.getElementById('sbj-profile-voice-code');
        let standingImageElement = document.getElementById('sbj-profile-image-dispratio');

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
        IconDialogController.Add((icon) => view.AddIcon(view, icon));
    }


    /**
     * アイコンの編集
     */
    public OnClickEditIcon(view: IconListView) {
        let icon = view.SelectionIcon();
        if (icon) {
            IconDialogController.Edit(icon, (newIcon) => this.UpdateIcon(view, icon, newIcon));
        }
    }


    /**
     * アイコンの削除
     */
    public OnClickDeleteIcon(view: IconListView) {
        let icon = view.SelectionIcon();
        if (icon) {
            IconDialogController.Delete(icon, (newIcon) => this.DeleteIcon(view, icon));
        }
    }


    /**
     * アイコンの追加
     * @param view 
     * @param imgRec 
     */
    public AddIcon(view: IconListView, icon: Icon) {

        let model = view._owner.Model;
        let actor = view._owner.Actor;

        //  アイコンデータ作成
        model.GetIconList(actor, (icons) => {

            icon.iid = StdUtil.CreateUuid();
            icon.order = Order.New(icons);

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
    public UpdateIcon(view: IconListView, preIcon: Personal.Icon, newIcon: Personal.Icon) {

        let model = view._owner.Model;
        let actor = view._owner.Actor;

        //  アイコンデータ作成
        model.GetIconList(actor, (icons) => {

            newIcon.iid = StdUtil.CreateUuid();

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
     */
    public DeleteIcon(view: IconListView, icon: Personal.Icon) {

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