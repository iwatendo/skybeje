import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";
import * as Home from "../../../Contents/IndexedDB/Home";
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import LinkUtil from "../../../Base/Util/LinkUtil";

import UserSettingsController from "../UserSettingsController";
import SettingComponent from "./SettingComponent";
import UserSettingsModel from "../UserSettingsModel";
import LocalCache from '../../../Contents/Cache/LocalCache';
import StdUtil from '../../../Base/Util/StdUtil';


export enum DBEnum {
    Personal = 0,
    Home = 1,
    Gadget = 2,
    Timeline = 3,
}

export interface OnImportComplete { (IsSucceed: boolean, msg: string): void }

/**
 * 
 */
export default class SettingController {

    private _element: HTMLElement;
    private _controller: UserSettingsController;

    /**
     * 
     */
    public constructor(controller: UserSettingsController, element: HTMLElement) {
        this._controller = controller;
        this._element = element;

        this.Initialize();
    }


    /**
     * 
     */
    private Initialize() {
        ReactDOM.render(<SettingComponent owner={this} controller={this._controller} />, this._element, () => {
        });
    }


    /**
     * 
     */
    public get Model(): UserSettingsModel {
        return this._controller.Model;
    }


    /**
     * 
     */
    public Export(exportdb: DBEnum) {

        switch (exportdb) {
            case DBEnum.Personal: this._controller.Model.PersonalDB.Export(); break;
            case DBEnum.Home: this._controller.Model.HomeDB.Export(); break;
            case DBEnum.Timeline: this._controller.Model.TimelineDB.Export(); break;
        }
    }


    /**
     * インポート処理
     */
    public Import(data: any, callback: OnImportComplete) {

        let db = this.FindImportDB(data);

        if (db === null) {
            callback(false, "インポートに失敗しました");
        }
        else {
            let msg = db.GetNote() + "情報をインポートしました。";
            db.Import(data, () => {
                callback(true, msg);
            });
        }
    }


    /**
     * 
     */
    public FindImportDB(data: any): any {

        if (this._controller.Model.PersonalDB.IsImportMatch(data)) return this._controller.Model.PersonalDB;
        if (this._controller.Model.HomeDB.IsImportMatch(data)) return this._controller.Model.HomeDB;
        if (this._controller.Model.TimelineDB.IsImportMatch(data)) return this._controller.Model.TimelineDB;

        return null;
    }


    /**
     * 全データの初期化
     */
    public InitializeDBAll() {
        LocalCache.InitializedSkybeje = false;
        LocalCache.Clear();
        location.href = LinkUtil.CreateLink("/");
    }

}

