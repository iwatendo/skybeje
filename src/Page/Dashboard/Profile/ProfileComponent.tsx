﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import * as Personal from "../../../Base/IndexedDB/Personal";

import { DragAction } from "../INaviContainer";
import DashboardController from "../DashboardController";
import ProfileItemComponent from "./ProfileItemComponent";
import ProfileView from "./ProfileView";
import ImageInfo from "../../../Base/Container/ImageInfo";


/**
 * プロパティ
 */
export interface ProfileProp {
    controller: DashboardController;
    view: ProfileView;
    actors: Array<Personal.Actor>;
}


/**
 * 
 */
export interface ProfileStat {
    actors: Array<Personal.Actor>;
    selectedActor: string;
}


export default class ProfileComponent extends React.Component<ProfileProp, ProfileStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ProfileProp, context?: any) {
        super(props, context);

        let selectedActor = "";

        if (this.props.actors.length > 0) {
            Order.Sort(this.props.actors);
            selectedActor = this.props.actors[0].aid;
        }

        this.state = {
            actors: props.actors,
            selectedActor: selectedActor,
        };

    }


    public render() {

        let userProfile = this.state.actors.filter(n => n.isUserProfile)[0];
        let isUserProfileSelect = (this.state.selectedActor === userProfile.aid);
        let userProfileItem = (<ProfileItemComponent key={userProfile.aid} owner={this} actor={userProfile} isSelect={isUserProfileSelect} />)

        let canEdit = false;
        let actorItems = this.state.actors.filter(n => !n.isUserProfile).map((actor) => {
            let isSelect = (this.state.selectedActor === actor.aid);
            if (isSelect) canEdit = true;
            return (<ProfileItemComponent key={actor.aid} owner={this} actor={actor} isSelect={isSelect} />);
        });

        let profileFrame = (<iframe id="sbj-profile-frame" className="sbj-profile-frame" hidden></iframe>);

        return (
            <div className="sbj-dashboard-profile">
                <div className="mdl-grid">
                    <div className="mdl-cell mdl-cell--12-col">
                        <h5 className="sbj-dashboard-profile-label">ユーザープロフィール</h5>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" onClick={(e) => this.EditProfile(userProfile.aid)}>
                            <i className='material-icons'>edit</i>
                            &nbsp;編集&nbsp;
                        </button>
                    </div>
                    {userProfileItem}
                    <div className="mdl-cell mdl-cell--12-col">
                        <h5 className="sbj-dashboard-profile-label">アクタープロフィール</h5>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" onClick={this.OnClick_AddActor.bind(this)}>
                            <i className='material-icons'>add</i>
                            &nbsp;追加&nbsp;
                        </button>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" disabled={!canEdit} onClick={this.OnClick_EditActor.bind(this)}>
                            <i className='material-icons'>edit</i>
                            &nbsp;編集&nbsp;
                        </button>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--accent" disabled={!canEdit} onClick={this.OnClick_DeleteActor.bind(this)}>
                            <i className='material-icons'>delete</i>
                            &nbsp;削除&nbsp;
                        </button>
                    </div>
                    {actorItems}
                </div>

                {profileFrame}
            </div>
        );
    }

    /**
     * アクターの選択
     */
    public SelectActor(actor: Personal.Actor) {
        this.setState({
            selectedActor: actor.aid
        });
    }


    /**
     * プロフィールの編集
     * @param actor 
     */
    public EditProfile(aid: string) {

        this.props.view.DoShoActorEditDialog(aid, () => {

            this.props.controller.Model.GetActor(aid, (actor) => {

                if (!actor) {
                    return;
                }

                //  更新データの差替え
                let newActors = this.state.actors.filter((a) => a.aid != aid);
                newActors.push(actor);
                Order.Sort(newActors);

                this.setState({
                    actors: newActors,
                    selectedActor: aid,
                }, () => {
                    let iid = (actor.iconIds.length > 0 ? actor.iconIds[0] : "");
                    this.props.controller.Model.GetIcon(iid, (icon) => {
                        let img = (icon == null ? null : icon.img);
                        ImageInfo.SetCss("sbj-icon-img-" + iid.toString(), img);
                    });

                    this.props.controller.ChangeActorNotify(aid);
                    
                });

            });

        });

    }


    /**
     * アクタープロフィールの追加
     */
    public OnClick_AddActor(event) {
        let prop = this.props;
        this.EditProfile(StdUtil.CreateUuid());
    }


    /**
     * アクタープロフィールの編集
     * @param event 
     */
    public OnClick_EditActor(event) {
        this.EditProfile(this.state.selectedActor);
    }


    /**
     * アクタープロフィールの編集
     * @param event 
     */
    public OnClick_DeleteActor(event) {
        if (this.state.selectedActor) {
            this.props.controller.Model.GetActor(this.state.selectedActor, (actor) => {
                if (actor.isUserProfile) {
                    return;
                }
                if (window.confirm('削除したアクターは元に戻せません。\n削除してよろしいですか？')) {
                    this.DeleteActor(actor);
                }
            });
        }
    }


    /**
     * アクターの削除処理
     */
    public DeleteActor(actor: Personal.Actor) {
        this.setState({
            actors: this.state.actors.filter((n) => n.aid !== actor.aid),
        });
        this.props.controller.Model.DeleteActor(actor);
    }


    /**
     * 外部からのドラッグイベント時に、「実行する処理」の設定
     */
    public SetDragFromOutsideAction(action: DragAction) {
        this.props.view.SetDragFromOutsideAction(action);
    }


    /**
     * アクターの並び順変更
     */
    public ChangeActorOrder(actors: Array<Personal.Actor>) {

        this.setState({
            actors: actors,
        }, () => {
            this.state.actors.forEach(cur => {
                this.props.controller.Model.UpdateActor(cur);
            });
        });
    }


}
