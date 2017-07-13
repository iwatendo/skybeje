import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import * as Personal from "../../../Base/IndexedDB/Personal";

import { DragAction } from "../INaviContainer";
import DashboardController from "../DashboardController";
import ProfileItemComponent from "./ProfileItemComponent";
import ProfileView from "./ProfileView";


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
}


export default class ProfileComponent extends React.Component<ProfileProp, ProfileStat> {


    private _selectedActor: string = '';


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ProfileProp, context?: any) {
        super(props, context);

        this.state = {
            actors: props.actors,
        };


        if (this.props.actors.length > 0) {
            Order.Sort(this.props.actors);
            this._selectedActor = this.props.actors[0].aid;
        }
    }


    public render() {

        this.state.actors.sort((a, b) => (a.order - b.order));

        let userProfile = this.props.actors.filter(n => n.isUserProfile)[0];
        let userProfileItem = (<ProfileItemComponent key={userProfile.aid} owner={this} actor={userProfile} isSelect={false} />)

        let actorItems = this.state.actors.filter(n => !n.isUserProfile).map((actor) => {
            let isSelect = (this._selectedActor === actor.aid);
            return (<ProfileItemComponent key={actor.aid} owner={this} actor={actor} isSelect={isSelect} />);
        });

        let profileFrame = (<iframe id="sbj-profile-frame" className="sbj-profile-frame" hidden></iframe>);

        return (
            <div className="sbj-dashboard-profile">
                <div className="mdl-grid">
                    <div className="mdl-cell mdl-cell--12-col">
                        <h5 className="sbj-dashboard-profile-label">ユーザープロフィール</h5>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" onClick={(e) => this.EditProfile(userProfile)}>
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
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--colored" onClick={this.OnClick_EditActor.bind(this)}>
                            <i className='material-icons'>edit</i>
                            &nbsp;編集&nbsp;
                        </button>
                        <button className="sbj-dashboard-profile-button mdl-button mdl-button--raised mdl-button--accent" onClick={this.OnClick_DeleteActor.bind(this)}>
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
        this._selectedActor = actor.aid;
    }


    /**
     * プロフィールの編集
     * @param actor 
     */
    public EditProfile(actor: Personal.Actor) {
        this.props.view.DoShoActorEditDialog(actor.aid);
    }


    /**
     * アクタープロフィールの追加
     */
    public OnClick_AddActor(event) {
        let prop = this.props;

        let newActor = new Personal.Actor();
        newActor.name = "";
        newActor.aid = StdUtil.CreateUuid();
        newActor.order = Order.New(this.state.actors);
        this.EditProfile(newActor);
    }


    /**
     * アクタープロフィールの編集
     * @param event 
     */
    public OnClick_EditActor(event) {
        this.props.view.DoShoActorEditDialog(this._selectedActor);
    }


    /**
     * アクタープロフィールの編集
     * @param event 
     */
    public OnClick_DeleteActor(event) {
        if (this._selectedActor) {
            this.props.controller.Model.GetActor(this._selectedActor, (actor) => {
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
     * アクター情報変更時処理
     */
    public UpdateActor(actor: Personal.Actor) {
        this.props.controller.Model.UpdateActor(actor);

        let list = this.state.actors.filter(n => n.aid !== actor.aid);
        list.push(actor);

        this.setState({ actors: list });
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
