import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import HomeVisitorController from "../HomeVisitorController";

/**
 * 
 */
export interface ActorDialogProp {
    controller: HomeVisitorController;
    actor: Personal.Actor;
}


export default class ActorDialogComponent extends React.Component<ActorDialogProp, any> {

    /**
     * 描画処理
     */
    public render() {

        let actor = this.props.actor;

        return (
            <div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-actor-name" disabled={true} value={actor.name}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-name">名前</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <input className="mdl-textfield__input" type="text" id="sbj-actor-tag" disabled={true} value={actor.tag}></input>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-tag">タグ</label>
                </div>
                <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-actor is-dirty">
                    <textarea className="mdl-textfield__input" type="text" rows={8} id="sbj-actor-note" disabled={true} value={actor.profile}></textarea>
                    <label className="mdl-textfield__label" htmlFor="sbj-actor-note">プロフィール</label>
                </div>
            </div>
        );
    }

}
