import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import CastVisitorController from "../CastVisitorController";
import MobileDialogComponent from "./MobileDialogComponent";


export default class MobileDialog extends AbstractDialogController<CastVisitorController, string> {

    private _linkUrl: string;


    /**
     * 
     * @param controller 
     */
    public constructor(controller: CastVisitorController) {
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


