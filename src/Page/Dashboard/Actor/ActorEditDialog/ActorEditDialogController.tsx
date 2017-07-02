
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../../Base/IndexedDB/Personal";
import AbstractDialogController from "../../../../Base/Common/AbstractDialogController";
import ActorEditDialogComponent from "./ActorEditDialogComponent";
import StdUtil from "../../../../Base/Util/StdUtil";
import DashboardController from "../../DashboardController";


export default class ActorEditDialogController extends AbstractDialogController<DashboardController, Personal.Actor> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: DashboardController) {
        super(controller, "アクター", "account_box");
    }


    /**
     * 
     */
    protected Initialize(actor: Personal.Actor) {
        this.SetResult(actor);
        let key = StdUtil.CreateUuid();
        ReactDOM.render(<ActorEditDialogComponent key={key} owner={this} actor={actor} />, this.ViewElement());
    }

}


