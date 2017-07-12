import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import MobileDialogComponent from "./MobileDialogComponent";


export default class MobileDialog extends AbstractDialogController<HomeVisitorController, string> {

    private _linkUrl: string;


    /**
     * 
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        super(controller, "モバイル", "cast", 392, 500);
    }


    /**
     * 
     * @param icon 
     */
    protected Initialize(url: string) {
        this._linkUrl = url;
        ReactDOM.render(<MobileDialogComponent key={url} controller={this.Controller} linkurl={url} />, this.ViewElement(), () => {
        });
    }

}


