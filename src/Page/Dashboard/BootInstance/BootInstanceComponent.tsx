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
            <div className="sbj-dashbord-boot-instance-layout">
                <div className="sbj-dashbord-boot-instance mdl-shadow--3dp">
                    <div className="sbj-dashbord-boot-instance-note">
                        <div className="mdl-card__supporting-text">
                            {bootButton}
                        </div>
                    </div>
                </div>
                <div className="sbj-dashbord-boot-instance mdl-shadow--3dp" hidden={hasError}>
                    <div className="sbj-dashbord-boot-instance-note">
                        <div className="mdl-card__supporting-text">
                            <h6 className="sbj-dashbord-boot-instance-note">
                                上記ボタンを押すと、このブラウザを擬似的なサーバーにしたWebRTCサービスを起動します。<br />
                                この画面では外部との通信を行いません。<br />
                                プロフィールや設定の変更が可能ですが、外部にデータ送信はされずブラウザに保持しているデータのみを更新をします。<br />
                                <br />
                                ホームインスタンスの起動に成功した場合、招待URLが表示されるので、招待したいメンバーにURLを伝えてください。<br />
                                （ただし大人数での利用はできません。PCのスペックや回線にも依存しますが数人での利用が適正です）<br />
                                <br />
                                ブラウザがサーバーの役割を果たす為、ホームインスタンスの停止または、ブラウザを閉じると接続しているメンバーのクライアントも停止します。<br />
                                また、起動の度に接続URLが変わります。終了したホームインスタンスのURLは再利用できないことに注意してください。<br />
                                <br />
                                ホームインスタンスが停止しても、登録したプロフィールやチャットの内容は消えません。<br />
                                プロフィール情報は各ユーザーのブラウザに保存され、チャットの内容はホームインスタンスを起動したブラウザに保存されます。<br />
                                <br />
                                （例）Ａさんがホームインスタンスを起動して、Ｂさんとチャットした場合、Ａさんのブラウザにチャットの内容が保存されます。<br />
                                後日、再度Ａさんがホームインスタンスを起動した場合、前回の内容が引き継がれますが、Ｂさんがホームインスタンスを起動してＡさんとチャットする場合、チャットの内容は引継がれません。<br />
                                <br />
                                （注意事項）チャット内容は、接続ユーザーに関わらず引継がれます。<br />
                                例えば上記の状態で、後日、Ａさんがホームインスタンスを起動してＣさんを招待した場合、ＡさんとＢさんのチャットの内容がＣさんに見られる可能性がある事に注意してください。<br />
                                <br />
                                ※チャットの内容は、ホームインスタンスページの「タイムラインクリア」で削除可能です。<br />
                            </h6>
                        </div>
                        <div className="mdl-card__supporting-text">
                            <h6 className="sbj-dashbord-boot-instance-note">
                                補足ページ<br />
                                ・<a id="architecrure" href="https://github.com/iwatendo/skybeje/wiki/Architecture" target="_blunk">ホームインスタンスとは？</a><br />
                                ・<a id="security" href="https://github.com/iwatendo/skybeje/wiki/Security" target="_blunk">セキュリティ対策について</a><br />
                                ・<a id="troubleshooting" href="https://github.com/iwatendo/skybeje/wiki/Troubleshooting" target="_blunk">トラブルシュート</a><br />
                            </h6>
                        </div>
                    </div>
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
