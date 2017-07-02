import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../../Base/IndexedDB/Home";

import StdUtil from "../../../../Base/Util/StdUtil";

import HomeEditDialogController from "./HomeEditDialogController";


/**
 * 
 */
export interface HomeEditDialogProp {
    owner: HomeEditDialogController;
    info: Home.Room;
}


/**
 * 
 */
export interface HomeEditDialogStat {
    info: Home.Room;
}


export default class HomeEditDialogComponent extends React.Component<HomeEditDialogProp, HomeEditDialogStat> {


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: HomeEditDialogProp, context?: any) {
        super(props, context);

        let pre = props.info;

        this.state = {
            info: StdUtil.DeepCopy(props.info),
        };
    }


    public render() {

        //  名前が未入力の場合、更新ボタンを押せないようにする
        let isNoName = (this.state.info.name === null || this.state.info.name.length === 0);
        this.props.owner.SetActionButtonDisabled(isNoName);

        return (
            <div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-info is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-info-name" spellCheck={false} maxLength={16} value={this.state.info.name} onChange={(e) => { this.OnChangeName(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-info-name">名前</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-info is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-info-tag" spellCheck={false} maxLength={64} value={this.state.info.tag} onChange={(e) => { this.OnChangeTag(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-info-tag">タグ</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-info is-dirty">
                    <textarea className="mdl-textfield__input" type="text" rows={8} id="sbj-info-note" spellCheck={false} maxLength={2048} value={this.state.info.text} onChange={(e) => { this.OnChangeText(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></textarea>
                    <label className="mdl-textfield__label" htmlFor="sbj-info-note">説明文</label>
                </div>
            </div>
        );
    }


    /**
     * 名前変更時イベント
     */
    public OnChangeName(event) {

        let name: string = event.target.value;
        this.state.info.name = (name ? name : "");

        this.setState({
            info: this.state.info,
        });
    }


    /**
     * タグ変更時イベント
     */
    public OnChangeTag(event) {

        let tag: string = event.target.value;
        this.state.info.tag = (tag ? tag : "");

        this.setState({
            info: this.state.info,
        });
    }


    /**
     * プロフィール（ステータス）変更時イベント
     */
    public OnChangeText(event) {
        this.state.info.text = event.target.value;
        this.setState({
            info: this.state.info,
        });
    }


    /**
     * 
     */
    public OnBlurHome(event) {
        this.props.owner.SetResult(this.state.info);
    }

}
