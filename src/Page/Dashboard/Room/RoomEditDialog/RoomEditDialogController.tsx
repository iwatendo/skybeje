import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../../Base/IndexedDB/Home";

import StdUtil from "../../../../Base/Util/StdUtil";

import AbstractDialogController from "../../../../Base/Common/AbstractDialogController";
import DashboardController from "../../DashboardController";
import RoomEditDialogComponent from "./RoomEditDialogComponent";


export default class RoomEditDialogController extends AbstractDialogController<DashboardController, Home.Room> {


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
        ReactDOM.render(<RoomEditDialogComponent key={key} owner={this} room={info} />, this.ViewElement());
    }

}


