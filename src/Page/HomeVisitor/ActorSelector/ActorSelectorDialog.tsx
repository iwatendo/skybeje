import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";
import StdUtil from "../../../Base/Util/StdUtil";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import ActorSelectorDialogComponent from "./ActorSelectorDialogComponent";


export default class ActorSelectorDialog extends AbstractDialogController<HomeVisitorController, UseActorSender> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "アクターの選択", "recent_actors", 748, 520);
    }


    /**
     * 
     * @param useActor 
     */
    protected Initialize(useActor: UseActorSender) {

        let clone = StdUtil.DeepCopy(useActor)

        //  アクター情報の取得
        this.Controller.Model.GetActors((actors) => {
            let key = StdUtil.CreateUuid();

            ReactDOM.render(<ActorSelectorDialogComponent key={key} owner={this} controller={this.Controller} actors={actors} useActor={clone} />, this.ViewElement());

        });
    }


    private _result: UseActorSender;


    /**
     * 
     * @param useActor 
     */
    public SetUseActor(useActor: UseActorSender) {
        this._result = useActor;
    }


    /**
     * データの追加
     */
    public Done() {
        if (this._result) {
            this.SetResult(this._result);
        }
        super.Done();
    }

}


