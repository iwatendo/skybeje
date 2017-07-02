import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../../Base/IndexedDB/Personal";
import ActorEditDialogController from "./ActorEditDialogController";
import StdUtil from "../../../../Base/Util/StdUtil";


/**
 * 
 */
export interface ActorEditDialogProp {
    owner: ActorEditDialogController;
    actor: Personal.Actor;
}


/**
 * 
 */
export interface ActorEditDialogStat {
    actor: Personal.Actor;
}


export default class ActorEditDialogComponent extends React.Component<ActorEditDialogProp, ActorEditDialogStat> {


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ActorEditDialogProp, context?: any) {
        super(props, context);

        this.state = {
            actor: StdUtil.DeepCopy(props.actor),
        };
    }


    public render() {

        //  名前が未入力の場合、更新ボタンを押せないようにする
        let isNoName = (this.state.actor.name === null || this.state.actor.name.length === 0);
        this.props.owner.SetActionButtonDisabled(isNoName);

        return (
            <div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-actor-name" spellCheck={false} maxLength={16} value={this.state.actor.name} onChange={(e) => { this.OnChangeName(e); }} onBlur={(e) => { this.OnBlurActor(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-name">名前</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-actor-tag" spellCheck={false} maxLength={64} value={this.state.actor.tag} onChange={(e) => { this.OnChangeTag(e); }} onBlur={(e) => { this.OnBlurActor(e); }}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-tag">タグ</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <textarea className="mdl-textfield__input" type="text" rows={8} id="sbj-actor-note" spellCheck={false} maxLength={2048} value={this.state.actor.profile} onChange={(e) => { this.OnChangeStatus(e); }} onBlur={(e) => { this.OnBlurActor(e); }}></textarea>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-note">プロフィール</label>
                </div>
            </div>
        );
    }


    /**
     * 名前変更時イベント
     */
    public OnChangeName(event) {

        let name: string = event.target.value;
        this.state.actor.name = (name ? name : "");

        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     * 名前変更時イベント
     */
    public OnChangeTag(event) {

        let tag: string = event.target.value;
        this.state.actor.tag = (tag ? tag : "");

        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     * プロフィール（ステータス）変更時イベント
     */
    public OnChangeStatus(event) {
        this.state.actor.profile = event.target.value;
        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     * 
     */
    public OnBlurActor(event) {
        this.props.owner.SetResult(this.state.actor);
    }

}
