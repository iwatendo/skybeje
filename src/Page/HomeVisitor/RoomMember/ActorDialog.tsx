
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import ActorDialogComponent from "./ActorDialogComponent";
import StdUtil from "../../../Base/Util/StdUtil";


export default class ActorDialog extends AbstractDialogController<HomeVisitorController, Personal.Actor> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "プロフィール", "account_box", 540, 480);
    }


    /**
     * 
     * @param actor 
     */
    protected Initialize(actor: Personal.Actor) {

        //  アクター情報の取得
        let key = actor.aid;
        let element = this.ViewElement();
        ReactDOM.render(<ActorDialogComponent key={key} controller={this.Controller} actor={actor} />, element, () => {
        });
    }

}


