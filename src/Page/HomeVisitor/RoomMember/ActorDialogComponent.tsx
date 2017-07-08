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
                <h5>
                    <span id="sbj-actor-profile-name">{actor.name}</span>
                    <br />
                    <span id="sbj-actor-profile-tag">{actor.tag}</span>
                </h5>
                <h6>
                    <span id="sbj-actor-profile-note">{actor.profile}</span>
                </h6>
            </div>
        );
    }

}
