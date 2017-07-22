import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../../Base/IndexedDB/Home";

import StdUtil from "../../../../Base/Util/StdUtil";

import RoomEditDialogController from "./RoomEditDialogController";


/**
 * 
 */
export interface RoomEditDialogProp {
    owner: RoomEditDialogController;
    room: Home.Room;
}


/**
 * 
 */
export interface RoomEditDialogStat {
    room: Home.Room;
}


export default class RoomEditDialogComponent extends React.Component<RoomEditDialogProp, RoomEditDialogStat> {


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: RoomEditDialogProp, context?: any) {
        super(props, context);

        let pre = props.room;

        this.state = {
            room: StdUtil.DeepCopy(props.room),
        };
    }


    public render() {

        //  名前が未入力の場合、更新ボタンを押せないようにする
        let isNoName = (this.state.room.name === null || this.state.room.name.length === 0);
        this.props.owner.SetActionButtonDisabled(isNoName);

        return (
            <div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-dashboard-room is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-dashboard-room-name" spellCheck={false} maxLength={16} value={this.state.room.name} onChange={(e) => { this.OnChangeName(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-dashboard-room-name">名前</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-dashboard-room is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-dashboard-room-tag" spellCheck={false} maxLength={64} value={this.state.room.tag} onChange={(e) => { this.OnChangeTag(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-dashboard-room-tag">タグ</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-dashboard-room is-dirty">
                    <textarea className="mdl-textfield__input" type="text" rows={8} id="sbj-dashboard-room-note" spellCheck={false} maxLength={2048} value={this.state.room.note} onChange={(e) => { this.OnChangeText(e); }} onBlur={(e) => { this.OnBlurHome(e); }}></textarea>
                    <label className="mdl-textfield__label" htmlFor="sbj-dashboard-room-note">説明文</label>
                </div>
            </div>
        );
    }


    /**
     * 名前変更時イベント
     */
    public OnChangeName(event) {

        let name: string = event.target.value;
        this.state.room.name = (name ? name : "");

        this.setState({
            room: this.state.room,
        });
    }


    /**
     * タグ変更時イベント
     */
    public OnChangeTag(event) {

        let tag: string = event.target.value;
        this.state.room.tag = (tag ? tag : "");

        this.setState({
            room: this.state.room,
        });
    }


    /**
     * プロフィール（ステータス）変更時イベント
     */
    public OnChangeText(event) {
        this.state.room.note = event.target.value;
        this.setState({
            room: this.state.room,
        });
    }


    /**
     * 
     */
    public OnBlurHome(event) {
        this.props.owner.SetResult(this.state.room);
    }

}
