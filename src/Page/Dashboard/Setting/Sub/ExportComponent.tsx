
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import FileUtil from "../../../../Base/Util/FileUtil";

import SettingController, { DBEnum } from "../SettingController";


/**
 * プロパティ
 */
export interface ExportProp {
    controller: SettingController;
}


export default class ExportComponent extends React.Component<ExportProp, any> {

    /**
     * 
     */
    public render() {

        let filestyle = {
            display: "none",
        }

        return (
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    <div className="mdl-card__supporting-text">
                        <h5>
                            このブラウザに保存してあるデータをファイルにエクスポートします。<br />
                            エクスポートしたファイルをインポートする事により、設定を復元できます。<br />
                        </h5>
                    </div>
                    <div className="sbj-dashbord-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportPersonalClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-dashbord-export-type">プロフィール／アクター</h6>
                    </div>
                    <div className="sbj-dashbord-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportHomeClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-dashbord-export-type">招待状／ルーム</h6>
                    </div>
                    <div className="sbj-dashbord-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportTimelineClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-dashbord-export-type">タイムラインメッセージ</h6>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * 
     */
    public OnExportPersonalClick(event) {
        this.props.controller.Export(DBEnum.Personal);
    }

    /**
     * 
     * @param event 
     */
    public OnExportHomeClick(event) {
        this.props.controller.Export(DBEnum.Home);
    }


    /**
     * 
     * @param event 
     */
    public OnExportTimelineClick(event) {
        this.props.controller.Export(DBEnum.Timeline);
    }

}
