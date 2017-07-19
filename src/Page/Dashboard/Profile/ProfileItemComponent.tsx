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
    isConnected: boolean,
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
            actor: props.actor,
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
                            <a href={al.msg} target="_blank">{dispurl}</a>
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

        let cellClass = "mdl-card mdl-shadow--4dp";
        if (this.props.isSelect) {
            cellClass += " sbj-dashboard-profile-cell-select";
        }
        else {
            cellClass += " sbj-dashboard-profile-cell";
        }

        return (
            <div className={cellClass} onClick={this.OnClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                <div className="sbj-dashboard-profile-card">
                    {image_div}
                    <div className='sbj-dashboard-profile-info'>
                        <h6 className='sbj-dashboard-profile-text'>
                            <span id="sbj-dashboard-profile-name">{actor.name}</span>
                            <br />
                            <span id="sbj-dashboard-profile-tag">{actor.tag}</span>
                        </h6>
                        <div className='sbj-dashborad-profile-action'>
                            <button className="sbj-dashboard-profile-edit-button mdl-button mdl-button--colored" onClick={this.OnEditClick.bind(this)}>
                                <i className='material-icons'>edit</i>
                                &nbsp;編集&nbsp;
                            </button>
                            <button className="sbj-dashboard-profile-edit-button mdl-button mdl-button--accent" onClick={this.OnDeleteClick.bind(this)} hidden={this.props.actor.isUserProfile}>
                                <i className='material-icons'>delete</i>
                                &nbsp;削除&nbsp;
                            </button>
                        </div>
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
        this.props.owner.EditProfile(actor.aid);
    }


    /**
     * 編集
     * @param event 
     */
    private OnEditClick(event) {
        let actor = this.props.actor;
        this.props.owner.EditProfile(actor.aid);
    }


    /**
     * 削除
     * @param event 
     */
    private OnDeleteClick(event) {
        let actor = this.props.actor;
        this.props.owner.DeleteProfile(actor.aid);
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