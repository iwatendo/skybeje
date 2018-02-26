
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SettingController, { DBEnum } from "../SettingController";


/**
 * プロパティ
 */
export interface InitializeProp {
    controller: SettingController;
}


/**
 * 
 */
export default class InitializeComponent extends React.Component<InitializeProp, any> {


    public render() {

        location.host

        return (
            <div className="mdl-grid">
                <div className="mdl-cell mdl-cell--12-col">
                    <div className="mdl-card__supporting-text">
                        <h5>
                            このブラウザに保存している IndexedDB({location.host}) を全て削除します。<br />
                            削除したデータは復元できませんので注意してください。<br />
                        </h5>
                    </div>
                    <div className="mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={this.OnClick.bind(this)}>
                            <i className='material-icons'>delete_forever</i>
                            &nbsp;初期化開始&nbsp;
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * 
     */
    public OnClick(event) {
        if (window.confirm('IndexedDBの初期化を行います。\n本当によろしいですか？')) {
            this.props.controller.InitializeDBAll();
        }
    }

}
