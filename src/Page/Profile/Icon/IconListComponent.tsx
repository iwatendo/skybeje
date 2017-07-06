import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import IconComponent from "../../Dashboard/Icon/IconComponent";
import { IIConOwner } from "../../Dashboard/Icon/IIConOwner";
import ProfileController from "../ProfileController";


/**
 * プロパティ
 */
export interface ProfileProp {
    controller: ProfileController;
    icons: Array<Personal.Icon>;
}

/**
 * ステータス
 */
export interface ProfileStat {
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
            icons: this.props.icons,
        };
    }



    public render() {

        Order.Sort(this.state.icons);

        let iconNodes = this.state.icons.map((icon) => {
            return (<IconComponent key={icon.iid} owner={this} icon={icon} />);
        });

        return (
            <div className="sbj-profile-icons-view-main">
                {iconNodes}
            </div>
        );
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

        let actor = this.props.controller.Actor;

        actor.iconIds = actor.iconIds.filter((n) => n !== icon.iid);

        this.setState({
            icons: this.state.icons.filter(n => n.iid !== icon.iid),
        }, () => {
            this.state.icons.map((icon) => {
                ImageInfo.SetCss(icon.iid, icon.img);
            });
        })

        this.props.controller.Model.UpdateActor(actor);
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

        let actor = this.props.controller.Actor;

        actor.iconIds = new Array<string>();
        icons.forEach((icon) => {
            actor.iconIds.push(icon.iid);
        });
        this.props.controller.Model.UpdateActor(actor);

        this.setState({
            icons: icons,
        }, () => {
            icons.forEach(cur => {
                this.props.controller.Model.UpdateIcon(cur);
            });
        });
    }

}
