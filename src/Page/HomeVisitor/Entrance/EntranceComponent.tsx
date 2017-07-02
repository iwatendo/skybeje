import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../../Base/IndexedDB/Home";

import { DialogMode } from "../../../Base/Common/AbstractDialogController";
import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import ActorPeer from "../../../Base/Container/ActorPeer";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";
import ActorSelectorDialog from "../ActorSelector/ActorSelectorDialog";



/**
 * プロパティ
 */
export interface EntranceProp {
    controller: HomeVisitorController;
    entrance: Home.Room;
}


export default class EntranceComponent extends React.Component<EntranceProp, any> {

    /**
     * 
     */
    public render() {

        let name = StdUtil.ToHtml(this.props.entrance.name);
        let text = StdUtil.ToHtml(this.props.entrance.text);

        let key: number = 0;
        let textDiv = text.split("<br/>").map((line) => {
            key += 1;
            return (<span key={key}>{line}<br /></span>);
        });


        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--overlay-drawer-button sbj-entrance" id="sbj-entrance">
                <div className="sbj-invitation-box">
                    <div className="mdl-card__supporting-text">
                        <h2 className="sbj-invitation-text">
                            {name}
                        </h2>
                        <h5 className="sbj-invitation-text">
                            {textDiv}
                        </h5>
                    </div>
                    <div>
                        <button id='sbj-start-visitor' className="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnStartClick.bind(this)}>
                            <i className="material-icons">directions_run</i>
                            &nbsp; 入室 &nbsp;
                        </button>
                        <button id='sbj-stop-visitor' className="mdl-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={this.OnQuitClick.bind(this)}>
                            <i className="material-icons">highlight_off</i>
                            &nbsp; 入室しない &nbsp;
                        </button>
                    </div>
                </div>
            </div >
        );
    }


    /**
     * 終了処理
     * @param e 
     */
    private OnQuitClick(e) {
        //  ダッシュボード側に通知
        this.props.controller.View.NotifyDashbord('');
    };


    /**
     * 入室処理
     * @param e 
     */
    private OnStartClick(e) {

        let controller = this.props.controller;

        this.props.controller.Model.GetUserProfile((actor) => {

            //  最初の接続時は、ユーザープロフィールのみで接続
            let useActor = new UseActorSender(actor);
            useActor.ActorPeers.push(new ActorPeer(actor, controller.PeerId));

            controller.SetUseActor(useActor);
        });

    }

}
