import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Contents/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import LogUtil from "../../../Base/Util/LogUtil";
import { Order } from "../../../Base/Container/Order";

import SelectActorController from "../SelectActorController";
import ProfileView from "./ProfileView";
import ProfileComponent from "./ProfileComponent";
import MessageUtil from "../../../Base/Util/MessageUtil";


/**
 * 
 */
export interface ProfileItemProp {
    owner: ProfileComponent;
    actor: Personal.Actor,
    isConnected: boolean,
    isSelect: boolean,
    isMultipleActor: boolean,
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

        let actor = this.state.actor;

        let imgIdName = "sbj-icon-img-" + actor.dispIid;
        let image_div = (<div className='sbj-dashboard-profile-img-box'><div className='sbj-dashboard-profile-img' id={imgIdName}></div></div>);

        let msgs = StdUtil.TextLineSplit(actor.profile);
        let ln = 0;
        let dispProfile = msgs.map(line => {
            let dispLine = MessageUtil.AutoLinkAnaylze(line).map((al) => {
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
            cellClass += " sbj-dashboard-profile-cell";
            //  cellClass += " sbj-dashboard-profile-cell-select";
        }
        else {
            cellClass += " sbj-dashboard-profile-cell";
        }

        let isUse = (actor.isUsing ? true : false);
        let isUseBtn = (isUse ? "check_box" : "check_box_outline_blank");

        //  アクター選択可否
        //  クライアント接続がある事かつ、ユーザープロフィールまたは、使用可能なアクターである事
        let canActorSelect = this.props.isMultipleActor && this.props.isConnected && (actor.isUserProfile || isUse);

        let canDelete = (!this.props.actor.isUserProfile && !canActorSelect);

        return (
            <div className={cellClass} onClick={this.OnClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                <div className="sbj-dashboard-profile-card">
                    {image_div}
                    <div className='sbj-dashboard-profile-info'>
                        <div className='sbj-dashboard-profile-info-top'>
                            <h6 className='sbj-dashboard-profile-text'>
                                <span id="sbj-dashboard-profile-name">{actor.name}</span>
                                <br />
                                <span id="sbj-dashboard-profile-tag">{actor.tag}</span>
                            </h6>
                            <div className='sbj-dashborad-profile-edit'>
                                <button className="sbj-dashboard-profile-edit-button mdl-button mdl-button--colored" onClick={this.OnEditClick.bind(this)}>
                                    <i className='material-icons'>edit</i>
                                    &nbsp;編集&nbsp;
                                </button>
                                <button className="sbj-dashboard-profile-edit-button mdl-button mdl-button--accent" onClick={this.OnDeleteClick.bind(this)} hidden={!canDelete}>
                                    <i className='material-icons'>delete</i>
                                    &nbsp;削除&nbsp;
                                </button>
                            </div>
                        </div>
                        <button className="sbj-dashboard-profile-actor-change-button mdl-button mdl-js-button mdl-button--raised" onClick={this.OnSelectClick.bind(this)} hidden={!canActorSelect}>
                            &nbsp;このアクターで発言する&nbsp;
                        </button>
                        <button className="sbj-dashboard-profile-usage-button sbj-dashboard-profile-edit-button mdl-button mdl-button--colored" onClick={this.OnUseClick.bind(this)} hidden={this.props.actor.isUserProfile}>
                            <i className='material-icons'>{isUseBtn}</i>
                            &nbsp;配置&nbsp;
                        </button>
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
     * 編集
     * @param event 
     */
    private OnEditClick(event) {
        let actor = this.props.actor;
        this.props.owner.EditProfile(actor.aid);
    }


    /**
     * 
     * @param event 
     */
    private OnUseClick(event) {
        let actor = this.state.actor;
        actor.isUsing = !(actor.isUsing ? true : false);
        this.setState({
            actor: actor,
        });

        let controller = this.props.owner.props.controller;
        controller.Model.UpdateActor(actor, () => {
            controller.ChangeActorNotify(actor.aid);
        });
    }


    /**
     * 選択
     * @param event 
     */
    private OnSelectClick(event) {
        let actor = this.props.actor;
        this.props.owner.props.controller.SelectActorNotify(actor.aid);
        this.props.owner.Close(false);
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
            LogUtil.Warning(this.props.owner.props.controller, e);
        }
    }

}