
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";
import ImageInfo from "../../../Base/Container/ImageInfo";
import StdUtil from "../../../Base/Util/StdUtil";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import IconSelectorDialogComponent from "./IconSelectorDialogComponent";


export default class IconSelectorDialog extends AbstractDialogController<HomeVisitorController, UseActorSender> {

    private _useActor: UseActorSender;


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "アイコン選択", "portrait", 520, 748);
    }


    /**
     * 
     * @param icon 
     */
    protected Initialize(useActor: UseActorSender) {

        this._useActor = useActor;
        this.SetResult(useActor);

        //  アクター情報の取得
        this.Controller.Model.GetActor(useActor.CurrentAid, (actor) => {

            //  アイコン情報の取得
            this.Controller.Model.GetIconList(actor, (icons) => {

                //  描画処理
                let key = StdUtil.CreateUuid();
                ReactDOM.render(<IconSelectorDialogComponent key={key} owner={this} controller={this.Controller} icons={icons} selectIid={useActor.CurrentIid} />, this.ViewElement(), () => {

                    icons.map((icon) => {
                        ImageInfo.SetCss(icon.iid, icon.img);
                    });

                });
            });

        });
    }


    /**
     * 選択アイコンを返します
     * @param iid 
     */
    public SelectImage(iid: string) {
        this._useActor.CurrentIid = iid;
        this.SetResult(this._useActor);
    }


}


