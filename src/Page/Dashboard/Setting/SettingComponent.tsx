import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";

import DashboardController from "../DashboardController";
import { DragAction } from "../INaviContainer";
import SettingController from "./SettingController";
import UserSettingComponent from "./Sub/UserSettingComponent";
import ExportComponent from "./Sub/ExportComponent";
import ImportComponent from "./Sub/ImportComponent";
import InitializeComponent from "./Sub/InitializeComponent";


enum MenuEnum {
    Menu_UserSetting = 0,
    Menu_Export = 1,
    Menu_Import = 2,
    Menu_Initialize = 9,
}


/**
 * プロパティ
 */
export interface SettingProp {
    controller: DashboardController;
    owner: SettingController;
}


/**
 * ステータス
 */
export interface SettingStat {
    select: MenuEnum,
}


/**
 * 設定パネル用クラス
 */
export default class SettingComponent extends React.Component<SettingProp, SettingStat> {


    private _selectedSetting: string = '';

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: SettingProp, context?: any) {
        super(props, context);

        this.state = {
            select: MenuEnum.Menu_UserSetting,
        };
    }


    public render() {

        let avatarstyle = {
            color: 'var(--sbj-color-default-text)',
            borderRadius: "0%",
            backgroundColor: "initial",
        };

        let baseClass = "mdl-list__item mdl-list__item--two-line";
        let selectClass = " mdl-card mdl-shadow--3dp";

        let liclass_usersetting = baseClass;
        let liclass_export = baseClass;
        let liclass_import = baseClass;
        let liclass_initialize = baseClass;
        let subpanel: any;

        switch (this.state.select) {
            case MenuEnum.Menu_UserSetting:
                liclass_usersetting += selectClass;
                subpanel = <UserSettingComponent controller={this.props.owner} />;
                break;
            case MenuEnum.Menu_Export:
                liclass_export += selectClass;
                subpanel = <ExportComponent controller={this.props.owner} />;
                break;
            case MenuEnum.Menu_Import:
                liclass_import += selectClass;
                subpanel = <ImportComponent controller={this.props.controller} owner={this.props.owner} />;
                break;
            case MenuEnum.Menu_Initialize:
                liclass_initialize += selectClass;
                subpanel = <InitializeComponent controller={this.props.owner} />;
                break;
        }

        return (
            <div className="sbj-split">

                <div className="sbj-split-left">
                    <div className="mdl-card__supporting-text">
                        <ul className="mdl-list">
                            <li className={liclass_usersetting} onClick={this.OnClickUserSetting.bind(this)}>
                                <span className="mdl-list__item-primary-content">
                                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>settings_applications</i>
                                    <span>ユーザー設定</span>
                                    <span className="mdl-list__item-sub-title"></span>
                                </span>
                            </li>
                            <li className={liclass_export} onClick={this.OnClickExport.bind(this)}>
                                <span className="mdl-list__item-primary-content">
                                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>archive</i>
                                    <span>エクスポート</span>
                                    <span className="mdl-list__item-sub-title">データをファイルに出力します</span>
                                </span>
                            </li>
                            <li className={liclass_import} onClick={this.OnClickImport.bind(this)}>
                                <span className="mdl-list__item-primary-content">
                                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>unarchive</i>
                                    <span>インポート</span>
                                    <span className="mdl-list__item-sub-title">データファイルを読み込みます。</span>
                                </span>
                            </li>
                            <li className={liclass_initialize} onClick={this.OnClickInitialize.bind(this)}>
                                <span className="mdl-list__item-primary-content">
                                    <i className="material-icons mdl-list__item-avatar" style={avatarstyle}>warning</i>
                                    <span>データの初期化</span>
                                    <span className="mdl-list__item-sub-title">全てのデータを削除します</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="sbj-split-right">
                    {subpanel}
                </div>

            </div>
        );
    }

    public OnClickUserSetting(ev) {
        this.setState({ select: MenuEnum.Menu_UserSetting });
    }

    public OnClickExport(ev) {
        this.setState({ select: MenuEnum.Menu_Export });
    }

    public OnClickImport(ev) {
        this.setState({ select: MenuEnum.Menu_Import });
    }

    public OnClickInitialize(ev) {
        this.setState({ select: MenuEnum.Menu_Initialize });
    }

}
