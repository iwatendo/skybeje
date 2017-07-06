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

    /**
     * コンストラクタ
     * @param owner 
     * @param element 
     */
    public constructor(owner: ProfileController, element: HTMLElement) {
        this._owner = owner;
        this._element = element;

        let addIconElement = document.getElementById('sbj-profile-append-icon');
        addIconElement.onclick = (e) => this.OnClickAddIcon(this);

        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {

        let actor = this._owner.Actor;

        this._owner.Model.GetIconList(actor, (icons) => {
            let key = StdUtil.CreateUuid();
            ReactDOM.render(<IconListComponent key={key} controller={this._owner} icons={icons} />, this._element, () => {
                icons.map((icon) => {
                    ImageInfo.SetCss(icon.iid, icon.img);
                });
            });
        });

    }


    /**
     * 
     */
    public OnClickAddIcon(view: IconListView) {
        ImageDialogController.Append((img) => view.OnImage_Append(view, img));
    }


    /**
     * 
     */
    public OnImage_Append(view: IconListView, imgRec: ImageInfo) {

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
                    view.Refresh();
                })
            })
        });
    }

}