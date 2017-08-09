import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";


/**
 * プロパティ
 */
export interface DisConnectProp {
    controller: HomeVisitorController;
}


export default class DisConnectComponent extends React.Component<DisConnectProp, any> {

    /**
     * 
     */
    public render() {

        return (
            <div>
                <div className="mdl-card__supporting-text">
                    <h4>
                        接続先のホームインスタンスが閉じられました。<br />
                        またはネットワークが切断されました。<br />
                    </h4>
                </div>
                <div className="mdl-card__actions">
                    <button id='sbj-home-visitor-stop' className="mdl-button mdl-button--raised mdl-button--accent" onClick={this.OnQuitClick.bind(this)}>
                        <i className="material-icons">exit_to_app</i>
                        &nbsp; 退室 &nbsp;
                    </button>
                    <button id='sbj-home-visitor-connect-retry' className="mdl-button mdl-button--raised mdl-button--colored" onClick={this.OnConnectClick.bind(this)}>
                        <i className="material-icons">exit_to_app</i>
                        &nbsp; 再接続 &nbsp;
                    </button>
                </div>
            </div>
        );
    }


    /**
     * ページを閉じる
     * @param e 
     */
    private OnQuitClick(e) {
        //  ダッシュボード側に通知
        this.props.controller.NotifyDashbord('');
    };


    /**
     * 再接続
     * @param e 
     */
    private OnConnectClick(e) {
        location.reload();
    }

}
