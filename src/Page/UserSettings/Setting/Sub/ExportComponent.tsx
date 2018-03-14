
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import FileUtil from "../../../../Base/Util/FileUtil";
import * as Home from "../../../../Contents/IndexedDB/Home";
import * as Timeline from "../../../../Contents/IndexedDB/Timeline";

import SettingController, { DBEnum } from "../SettingController";
import StdUtil from "../../../../Base/Util/StdUtil";


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
                            このブラウザに保存してあるデータをファイルに出力します。<br />
                            エクスポートしたファイルをインポートする事により、設定を復元できます。<br />
                        </h5>
                    </div>
                    <div className="sbj-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportPersonalClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-export-type">プロフィール情報</h6>
                    </div>
                    <div className="sbj-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportHomeClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-export-type">チャットルーム設定</h6>
                    </div>
                    <div className="sbj-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportTimelineClick.bind(this)}>
                            <i className='material-icons'>archive</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-export-type">タイムライン情報</h6>
                    </div>
                    <div className="sbj-export mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnExportTimelineTextClick.bind(this)}>
                            <i className='material-icons'>note</i>
                            &nbsp;エクスポート&nbsp;
                        </button>
                        <h6 className="sbj-export-type">タイムライン（CSV）</h6>
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


    /**
     * 
     * @param event 
     */
    public OnExportTimelineTextClick(event) {

        let model = this.props.controller.Model;

        model.TimelineDB.ReadAllData((timeline) => {
            model.HomeDB.ReadAllData((home) => {
                let result = this.ToPlainText(timeline.Messages, home.Rooms);
                let filename = FileUtil.GetDefaultFileName("Timeline", "txt");
                FileUtil.Export(filename, result);
            });
        });
    }


    /**
     * 
     * @param msgs 
     */
    private ToPlainText(msgs: Array<Timeline.Message>, rooms: Array<Home.Room>): string {

        let result = new String();

        //  部屋情報をMAPにする
        let roomMap = new Map<string, Home.Room>();
        rooms.forEach((room) => { roomMap.set(room.hid, room); });

        //  メッセージを時間順にソート
        msgs.sort((a, b) => (a.ctime > b.ctime ? 1 : -1));

        //  メッセージループ
        msgs.forEach((msg) => {
            if (msg.visible) {
                let time = StdUtil.ToDispDate(new Date(msg.ctime));
                let room = (roomMap.has(msg.hid) ? roomMap.get(msg.hid).name : "");
                let name = msg.name;
                let text = msg.text;
                //  JavaScriptの文字列は連結は += が速いらしい・・（未検証）
                result += time;
                result += ",";
                result += room;
                result += ",";
                result += name;
                result += ",";
                result += text;
                result += "\r\n";
            }
        });

        return result.toString();
    }

}
