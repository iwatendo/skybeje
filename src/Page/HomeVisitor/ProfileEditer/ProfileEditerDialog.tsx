import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import ProfileEditerDialogComponent from "./ProfileEditerDialogComponent";


export default class ProfileEditerDialog extends AbstractDialogController<HomeVisitorController, string> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "プロフィール", "account_box", 780, 920);
    }


    /**
     * 
     * @param icon 
     */
    protected Initialize(aid: string) {

        ReactDOM.render(<ProfileEditerDialogComponent key={aid} controller={this.Controller} aid={aid} />, this.ViewElement(), () => {
        });
    }

}


