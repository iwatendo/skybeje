import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import DashboardController from "../DashboardController";
import ImageDialogController from "../ImageDialogController";
import IconComponent from "../Icon/IconComponent";
import { IIConOwner } from "../Icon/IIConOwner";
import ProfileView from "./ProfileView";


/**
 * プロパティ
 */
export interface ProfileProp {
    controller: DashboardController;
    view: ProfileView;
    actor: Personal.Actor;
    icons: Array<Personal.Icon>;
}

/**
 * ステータス
 */
export interface ProfileStat {
    actor: Personal.Actor;
    icons: Array<Personal.Icon>;
}


export default class ProfileComponent extends React.Component<ProfileProp, ProfileStat> implements IIConOwner {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ProfileProp, context?: any) {
        super(props, context);

        this.state = {
            actor: this.props.actor,
            icons: this.props.icons,
        };

        this.props.view.SetDragFromOutsideAction(() => {
            this.OnClick_AddIcon(null);
        });
    }



    public render() {

        Order.Sort(this.state.icons);

        let iconNodes = this.state.icons.map((icon) => {
            return (<IconComponent key={icon.iid} owner={this} icon={icon} />);
        });

        return (
            <div className="sbj-profile-grid mdl-grid">
                <div className="mdl-cell mdl-cell--12-col mdl-card mdl-shadow--4dp sbj-profile-cell">
                    <div className="mdl-card__supporting-text">
                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-profile is-dirty">
                            <input className="mdl-textfield__input" type="text" id="sbj-profile-name" spellCheck={false} maxLength={16} value={this.state.actor.name} onChange={(e) => { this.OnChangeName(e); }} onBlur={(e) => { this.OnBlurName(e); }}　></input>
                            <label className="mdl-textfield__label" htmlFor="sbj-profile-name">表示名</label>
                        </div>
                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-profile is-dirty">
                            <input className="mdl-textfield__input" type="text" id="sbj-profile-tag" spellCheck={false} maxLength={64} value={this.state.actor.tag} onChange={(e) => { this.OnChangeTag(e); }} onBlur={(e) => { this.OnBlurProfile(e); }}></input>
                            <label className="mdl-textfield__label" htmlFor="sbj-profile-tag">タグ</label>
                        </div>
                        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label sbj-profile is-dirty">
                            <textarea className="mdl-textfield__input" type="text" rows={3} id="sbj-profile-note" spellCheck={false} maxLength={2048} value={this.state.actor.profile} onChange={(e) => { this.OnChangeProfile(e); }} onBlur={(e) => { this.OnBlurProfile(e); }}></textarea>
                            <label className="mdl-textfield__label" htmlFor="sbj-profile-note">プロフィール</label>
                        </div>
                    </div>
                </div>
                <div className="mdl-cell mdl-cell--12-col">
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnClick_AddIcon.bind(this)}>
                        <i className='material-icons'>add</i>
                        アイコンの追加
                    </button>
                </div>
                {iconNodes}
            </div>
        );
    }

    /**
     * 「名前」変更時イベント
     */
    public OnChangeName(event) {

        let name: string = event.target.value;
        this.state.actor.name = (name ? name : "");

        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     *  ロストフォーカスで更新処理
     */
    public OnBlurName(event) {

        let name: string = event.target.value;
        if (!name) {
            this.state.actor.name = "名前未設定";
            this.setState({
                actor: this.state.actor,
            });
        }

        this.OnBlurProfile(event);
    }


    /**
     * 「タグ」変更時イベント
     */
    public OnChangeTag(event) {
        this.state.actor.tag = event.target.value;
        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     * 「プロフィール」変更時イベント
     */
    public OnChangeProfile(event) {
        this.state.actor.profile = event.target.value;
        this.setState({
            actor: this.state.actor,
        });
    }


    /**
     *  ロストフォーカスで更新処理
     */
    public OnBlurProfile(event) {
        this.props.controller.Model.UpdateActor(this.state.actor);
    }


    /**
     * アイコン追加時
     */
    public OnClick_AddIcon(event) {
        let prop = this.props;
        ImageDialogController.Add((img) => this.OnImage_Append(prop, img));
    }


    /**
     * 
     */
    public OnImage_Append(prop: ProfileProp, imageRec: ImageInfo) {

        //  アイコンデータ作成
        let icon = new Personal.Icon();
        icon.iid = StdUtil.CreateUuid();
        icon.order = Order.New(this.state.icons);
        icon.img = imageRec;
        prop.controller.Model.UpdateIcon(icon);

        let icons = this.state.icons;
        icons.push(icon);

        //  プロフィールにアイコン追加して更新
        this.state.actor.iconIds.push(icon.iid);
        prop.controller.Model.UpdateActor(this.state.actor);



        this.setState({
            actor: this.state.actor,
            icons: icons,
        }, () => {
            ImageInfo.SetCss(icon.iid, imageRec);
        });
    }


    /**
     * 
     * @param icon 
     */
    public UpdateIcon(icon: Personal.Icon) {
        this.props.controller.Model.UpdateIcon(icon);
    }


    /**
     * アイコンの削除処理
     */
    public DeleteIcon(icon: Personal.Icon) {

        this.state.actor.iconIds = this.state.actor.iconIds.filter((n) => n !== icon.iid);

        this.setState({
            actor: this.state.actor,
            icons: this.state.icons.filter(n => n.iid !== icon.iid),
        }, () => {
            this.state.icons.map((icon) => {
                ImageInfo.SetCss(icon.iid, icon.img);
            });
        })

        this.props.controller.Model.UpdateActor(this.state.actor);
        this.props.controller.Model.DeleteIcon(icon);
    }


    /**
     * アイコンリストの取得
     */
    public GetIconList(): Array<Personal.Icon> {
        return this.state.icons;
    }


    /**
     * アイコンの並び順変更
     */
    public ChangeIconOrder(icons: Array<Personal.Icon>) {

        this.state.actor.iconIds = new Array<string>();
        icons.forEach((icon) => {
            this.state.actor.iconIds.push(icon.iid);
        });
        this.props.controller.Model.UpdateActor(this.state.actor);

        this.setState({
            icons: icons,
        }, () => {
            icons.forEach(cur => {
                this.props.controller.Model.UpdateIcon(cur);
            });
        });
    }

}
