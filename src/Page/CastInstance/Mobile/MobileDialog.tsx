import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractDialogController from "../../../Base/Common/AbstractDialogController";

import CastInstanceController from "../CastInstanceController";
import MobileDialogComponent from "./MobileDialogComponent";


export default class MobileDialog extends AbstractDialogController<CastInstanceController, string> {

    private _linkUrl: string;


    /**
     * 
     * @param controller 
     */
    public constructor(controller: CastInstanceController) {
        super(controller, "モバイル配信", "cast", 392, 500);
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


