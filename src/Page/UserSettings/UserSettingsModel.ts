import DBContainer from "../../Contents/IndexedDB/DBContainer";
import * as Personal from "../../Contents/IndexedDB/Personal";
import * as Home from "../../Contents/IndexedDB/Home";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import AbstractServiceModel, { OnModelLoad } from "../../Base/AbstractServiceModel";
import UserSettingsController from "./UserSettingsController";


export default class UserSettingsModel extends AbstractServiceModel<UserSettingsController> {

    private _dbc: DBContainer;

    public get PersonalDB() { return this._dbc.PersonalDB; }
    public get HomeDB() { return this._dbc.HomeDB; }
    public get TimelineDB() { return this._dbc.TimelineDB; }
    public get LiveHTMLDB() { return this._dbc.LiveHTMLDB; }


    /**
     * 
     * @param callback
     */
    protected Initialize(callback: OnModelLoad) {
        this._dbc = new DBContainer();
        this._dbc.ConnectAll(() => {
            callback();
        });
    }

}
