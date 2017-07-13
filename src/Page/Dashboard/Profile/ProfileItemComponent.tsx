import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import LogUtil from "../../../Base/Util/LogUtil";
import { Order } from "../../../Base/Container/Order";

import DashboardController from "../DashboardController";
import ProfileView from "./ProfileView";
import ProfileComponent from "./ProfileComponent";
import LinkUtil from "../../../Base/Util/LinkUtil";


/**
 * 
 */
export interface ProfileItemProp {
    owner: ProfileComponent;
    actor: Personal.Actor,
    isSelect: boolean,
}


/**
 * 
 */
export interface ProfileItemStat {
    actor: Personal.Actor,
}


/**
 * 
 */
export default class ProfileItemComponent extends React.Component<ProfileItemProp, ProfileItemStat>{

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ProfileItemProp, context?: any) {
        super(props, context);

        this.state = {
            actor: this.props.actor,
        };
    }


    /**
     * 
     */
    public render() {

        let actor = this.props.actor;

        let iids = actor.iconIds;
        let iid = (iids.length > 0 ? iids[0] : "");

        let imgIdName = "sbj-icon-img-" + iid.toString();
        let image_div = (<div className='sbj-dashboard-profile-img-box'><div className='sbj-dashboard-profile-img' id={imgIdName}></div></div>);

        let msgs = StdUtil.TextLineSplit(actor.profile);
        let ln = 0;
        let dispProfile = msgs.map(line => {

            let dispLine = LinkUtil.AutoLinkAnaylze(line).map((al) => {
                if (al.isLink) {
                    let dispurl = decodeURI(al.msg);
                    return (
                        <span>
                            <a className="sbj-timeline-message-autolink" href={al.msg} target="_blank">{dispurl}</a>
                        </span>
                    );
                }
                else {
                    return (<span>{al.msg}</span>);
                }
            });

            ln++;
            if (ln === msgs.length) {
                return (<span key={ln}>{dispLine}</span>);
            }
            else {
                return (<span key={ln}>{dispLine}<br /></span>);
            }
        });

        return (
            <div className="mdl-cell mdl-cell--6-col mdl-card mdl-shadow--4dp" onClick={this.OnClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                <div className="sbj-dashboard-profile-card">
                    {image_div}
                    <div className='sbj-dashboard-profile-text'>
                        <h6>
                            <span id="sbj-dashboard-profile-name">{actor.name}</span>
                            <br />
                            <span id="sbj-dashboard-profile-tag">{actor.tag}</span>
                        </h6>
                        <span id="sbj-dashboard-profile-note">{dispProfile}</span>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * 
     */
    private OnClick(event) {
        this.props.owner.SelectActor(this.props.actor);
    }


    /**
     * 
     */
    private OnDoubleClick(event) {
        let actor = this.props.actor;
        this.props.owner.props.view.DoShoActorEditDialog(actor.aid);
    }


    /**
     * アクターのドラッグ開始時
     */
    private OnDragStart(ev: DragEvent) {
        let json = JSON.stringify(this.props.actor);
        ev.dataTransfer.setData("text", json);
    }

    /**
     * ドロップ時イベント
     */
    private OnDrop(ev: DragEvent) {
        let text = ev.dataTransfer.getData("text");

        try {

            let dragActor: Personal.Actor = JSON.parse(text);     //  移動元
            let dropActor = this.props.actor;                     //  移動先

            if (dragActor && dragActor.aid) {
                let preList = this.props.owner.state.actors;
                let newList = Order.Swap(preList, dragActor, dropActor);

                this.props.owner.ChangeActorOrder(newList);
            }

        } catch (e) {
            LogUtil.Warning(e);
        }
    }

}