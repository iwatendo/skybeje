import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../../Base/IndexedDB/Home";

import StdUtil from "../../../../Base/Util/StdUtil";

import AbstractDialogController from "../../../../Base/Common/AbstractDialogController";
import DashboardController from "../../DashboardController";
import HomeEditDialogComponent from "./HomeEditDialogComponent";


export default class HomeEditDialogController extends AbstractDialogController<DashboardController, Home.Room> {


    /**
     * 
     * @param controller 
     */
    public constructor(controller: DashboardController) {
        super(controller, "ホーム", "note");
    }


    /**
     * 
     */
    protected Initialize(info: Home.Room) {
        this.SetResult(info);
        let key = StdUtil.CreateUuid();
        ReactDOM.render(<HomeEditDialogComponent key={key} owner={this} info={info} />, this.ViewElement());
    }

}


