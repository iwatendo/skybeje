import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";

import { DragAction } from "../INaviContainer";
import BootInstanceView from "./BootInstanceView";


/**
 * プロパティ
 */
export interface BootInstanceProp {
    controller: BootInstanceView;
    bootDuplication: boolean;
}


export default class BootInstanceComponent extends React.Component<BootInstanceProp, any> {


    public render() {

        let hasError = false;
        let bootButton;

        if (this.props.bootDuplication) {
            hasError = true;
            bootButton = (
                <div>
                    <h6>
                        起動済みのホームインスタンスが検出されました。<br />
                        ホームインスタンスは同時に複数起動することはできません。<br />
                        前回の起動時に、正常終了しなかった場合にも検出される事があります。
                    </h6>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent sbj-start-instance" onClick={this.OnClick_HomeInstanceForceBoot.bind(this)}>
                        <i className='material-icons'>cast</i>
                        &nbsp;ホームインスタンスの強制起動&nbsp;
                    </button>
                    <h6>
                        ホームインスタンスを複数起動した場合<br />
                        どちらのインスタンスも正常に動作しなくなるので注意してください。
                    </h6>
                </div>
            );
        }
        else {
            bootButton = (
                <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored sbj-start-instance" onClick={this.OnClick_HomeInstanceStart.bind(this)}>
                    <i className='material-icons'>cast</i>
                    &nbsp;ホームインスタンスの起動&nbsp;
                </button>
            );
        }

        return (
            <div className="sbj-dashbord-boot-instance mdl-shadow--3dp">
                <div className="mdl-card__supporting-text">
                    {bootButton}
                </div>
                <div className="mdl-card__supporting-text" hidden={hasError}>
                    <h6 className="sbj-dashbord-boot-instance-note">
                        ・<a id="architecrure" href="https://github.com/iwatendo/skybeje/wiki/Architecture" target="_blunk">ホームインスタンスとは？</a><br />
                        ・<a id="security" href="https://github.com/iwatendo/skybeje/wiki/Security" target="_blunk">セキュリティ対策について</a>
                    </h6>
                </div>
            </div>
        );
    }


    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
    }


    /**
     * ホームインスタンス起動
     * @param event 
     */
    public OnClick_HomeInstanceStart(event) {
        this.props.controller.StartHomeInstance(false);
    }


    /**
     * ホームインスタンスの強制起動
     * @param event 
     */
    public OnClick_HomeInstanceForceBoot(event) {
        this.props.controller.StartHomeInstance(true);
    }

}
