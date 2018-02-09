import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";
import * as Home from "../../../Contents/IndexedDB/Home";
import * as Friend from "../../../Contents/IndexedDB/Friend";
import * as Timeline from "../../../Contents/IndexedDB/Timeline";

import LinkUtil from "../../../Base/Util/LinkUtil";

import DashboardController from "../DashboardController";
import { INaviContainer, DragAction } from "../INaviContainer";
import SettingComponent from "./SettingComponent";
import DashboardModel from "../DashboardModel";
import LocalCache from '../../../Contents/Cache/LocalCache';


export enum DBEnum {
    Personal = 0,
    Home = 1,
    Gadget = 2,
    Friend = 3,
    Timeline = 4,
}

export interface OnImportComplete { (IsSucceed: boolean, msg: string): void }

/**
 * 
 */
export default class SettingController implements INaviContainer {

    private _controller: DashboardController;
    private _element: HTMLElement;
    private _dragFromOutSizeAction: DragAction;

    /**
     * 
     */
    public constructor(controller: DashboardController, element: HTMLElement) {
        this._controller = controller;
        this._element = element;
        this.Refresh();
    }


    /**
     * 
     */
    public Refresh() {
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
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
        this._dragFromOutSizeAction = action;
    }


    /**
     *  外部からのドラッグイベント時に呼ばれる処理
     */
    public OnDragFromOutside(event: DragEvent) {
        if (this._dragFromOutSizeAction) {
            this._dragFromOutSizeAction();
        }
    }


    /**
     * 
     */
    public get Model(): DashboardModel {
        return this._controller.Model;
    }


    /**
     * 
     */
    public Export(exportdb: DBEnum) {

        switch (exportdb) {
            case DBEnum.Personal: this._controller.Model.PersonalDB.Export(); break;
            case DBEnum.Home: this._controller.Model.HomeDB.Export(); break;
            case DBEnum.Friend: this._controller.Model.FriendDB.Export(); break;
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
        if (this._controller.Model.FriendDB.IsImportMatch(data)) return this._controller.Model.FriendDB;
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

