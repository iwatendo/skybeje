﻿
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SettingController, { DBEnum } from "../SettingController";
import FileUtil from "../../../../Base/Util/FileUtil";
import StdUtil from "../../../../Base/Util/StdUtil";
import UserSettingsController from "../../UserSettingsController";


/**
 * プロパティ
 */
export interface ImportProp {
    controller: UserSettingsController,
    owner: SettingController,
}


/**
 * インポート結果
 */
export class ImportResult {
    isSucceed: boolean;
    message: string;
}


/**
 * ステータス
 */
export interface ImportStat {
    message: Array<ImportResult>,
}


export default class ImportComponent extends React.Component<ImportProp, ImportStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ImportProp, context?: any) {
        super(props, context);

        this.state = {
            message: new Array<ImportResult>(),
        };

    }



    public render() {

        let reslutMessage = this.state.message.map((ir) => {
            let key = StdUtil.CreateUuid();
            return <h5 key={key}>{ir.message}</h5>
        });

        let isBootServent = this.props.controller.View.IsBootServent();

        return (
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    <div className="mdl-card__supporting-text">
                        <h5>
                            エクスポートしたファイルを読み込みます。<br />
                            現在のデータは上書きされる為、必要に応じて事前にエクスポートでバックアップしてください。<br />
                            <br />
                            （注意）チャットサーバー/クライアントの起動中はインポートは実行しないでください。<br />
                        </h5>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" disabled={isBootServent} onClick={this.OnClick.bind(this)}>
                            <i className='material-icons'>unarchive</i>
                            &nbsp;ファイルを選択&nbsp;
                        </button>
                        {reslutMessage}
                        <h6 hidden={!isBootServent}>
                            ※チャットサーバーまたはクライアントの起動中はインポート処理できません。
                        </h6>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * 
     */
    public OnClick(event) {

        this.setState({
            message: new Array<ImportResult>(),
        });


        FileUtil.SelectImportFile((file) => {

            FileUtil.Import(file,
                (data) => {
                    this.props.owner.Import(data,
                        (isSucceed, msg) => {
                            let result = new ImportResult();
                            result.isSucceed = isSucceed;
                            result.message = msg;
                            let msgs = this.state.message;
                            msgs.push(result);
                            this.setState({
                                message: msgs
                            });
                        }
                    );
                }, (err: Error) => {
                    let msg = file.name + "\n" + err;
                    alert(msg); 
                }
            );
        });

    }

}
