import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import * as Personal from "../../../Contents/IndexedDB/Personal";

import SelectActorController from "../SelectActorController";
import ProfileItemComponent from "./ProfileItemComponent";
import ProfileView from "./ProfileView";
import ImageInfo from "../../../Base/Container/ImageInfo";


/**
 * プロパティ
 */
export interface ProfileProp {
    controller: SelectActorController;
    view: ProfileView;
    actors: Array<Personal.Actor>;
    isConnected: boolean,
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
        let isMultipleActor = (this.state.actors.length > 1);
        let isUserProfileSelect = (this.state.selectedActor === userProfile.aid);
        let isConnected = (this.props.isConnected);

        let isDispBackButton = false;   //  戻るボタンは非表示にしておく

        let userProfileItem = (<ProfileItemComponent key={Personal.Actor.HashCode(userProfile)} owner={this} actor={userProfile} isConnected={isConnected} isMultipleActor={isMultipleActor} isSelect={isUserProfileSelect} />)

        let canEdit = false;
        let actorItems = this.state.actors.filter(n => !n.isUserProfile).map((actor) => {
            let isSelect = (this.state.selectedActor === actor.aid);
            if (isSelect) canEdit = true;
            return (<ProfileItemComponent key={Personal.Actor.HashCode(actor)} owner={this} actor={actor} isConnected={isConnected} isMultipleActor={isMultipleActor} isSelect={isSelect} />);
        });

        let profileFrame = (<iframe id="sbj-profile-frame" className="sbj-profile-frame" hidden></iframe>);

        return (
            <div className="sbj-dashboard-profile" onClick={this.OnClick_background.bind(this)}>
                <div className="sbj-dashboard-profile-grid">
                    <div className="sbj-dashboard-profile-label-card">
                        <h5 className="sbj-dashboard-profile-label">ユーザープロフィール</h5>
                        <button id="sbj-dashboard-profile-back" className="sbj-dashboard-profile-button mdl-button mdl-button--raised" onClick={this.OnClick_Back.bind(this)} hidden={!isDispBackButton}>
                            <i className='material-icons'>navigate_before</i>
                            &nbsp;戻る&nbsp;
                        </button>
                    </div>
                    {userProfileItem}
                    <div className="sbj-dashboard-profile-label-card">
                        <h5 className="sbj-dashboard-profile-label">アクター</h5>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" onClick={this.OnClick_AddActor.bind(this)}>
                            <i className='material-icons'>add</i>
                            &nbsp;追加&nbsp;
                        </button>
                    </div>
                    {actorItems}
                </div>

                {profileFrame}
            </div>
        );
    }


    /**
     * バックグラウンドのクリック時処理
     * @param event 
     */
    public OnClick_background(event) {

        if (event && event.target && (
            event.target.className === 'sbj-dashboard-profile' ||
            event.target.className === 'sbj-dashboard-profile-grid'
        )) {
            this.props.controller.PostClose();
        }
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
     * プロフィールを編集
     * @param actor 
     */
    public EditProfile(aid: string) {
        this.props.view.DoShoActorEditDialog(aid);
    }


    public UpdateProfile(aid: string) {

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
                let iid = actor.dispIid;
                this.props.controller.Model.GetIcon(iid, (icon) => {
                    let img = (icon == null ? null : icon.img);
                    ImageInfo.SetCss("sbj-icon-img-" + iid.toString(), img);
                });
            });

        });


    }

    /**
     * 「戻る」ボタン押下時処理
     * @param ev 
     */
    public OnClick_Back(ev) {
        this.props.controller.PostClose();
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
     * @param aid 
     */
    public DeleteProfile(aid: string) {
        this.props.controller.Model.GetActor(aid, (actor) => {
            if (actor.isUserProfile) {
                return;
            }
            if (window.confirm('削除したアクターは元に戻せません。\n削除してよろしいですか？')) {
                this.DeleteActor(actor);
            }
        });
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
