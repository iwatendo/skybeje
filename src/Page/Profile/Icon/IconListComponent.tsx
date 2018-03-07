import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";

import * as Personal from "../../../Contents/IndexedDB/Personal";

import ProfileController from "../ProfileController";
import IconListItemComponent from "./IconListItemComponent";
import IconListView from "./IconListView";


/**
 * プロパティ
 */
export interface IconListProp {
    controller: ProfileController;
    icons: Array<Personal.Icon>;
    selectIid: string;
}

/**
 * ステータス
 */
export interface IconListStat {
    icons: Array<Personal.Icon>;
    selectIid: string;
}


export default class IconListComponent extends React.Component<IconListProp, IconListStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: IconListProp, context?: any) {
        super(props, context);

        this.state = {
            icons: this.props.icons,
            selectIid: this.props.selectIid,
        };
    }



    public render() {

        Order.Sort(this.state.icons);

        let canEdit = (this.state.selectIid);
        (document.getElementById('sbj-profile-edit-icon') as HTMLInputElement).disabled = !canEdit;
        (document.getElementById('sbj-profile-delete-icon') as HTMLInputElement).disabled = !canEdit;

        let iconNodes = this.state.icons.map((icon) => {

            let isSelect = (icon.iid === this.state.selectIid);
            return (<IconListItemComponent key={icon.iid} owner={this} icon={icon} isSelect={isSelect} />);

        });

        return (
            <div className="sbj-profile-icons-view-main mdl-grid">
                {iconNodes}
            </div>
        );
    }


    /**
     * 選択アイコンの変更
     * @param icon 
     */
    public Select(iid: string) {

        let actor = this.props.controller.Actor;
        actor.dispIid = iid;

        this.setState({
            selectIid: iid
        });
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

        let controller = this.props.controller;
        let actor = controller.Actor;

        actor.iconIds = new Array<string>();
        icons.forEach((icon) => {
            actor.iconIds.push(icon.iid);
        });
        this.props.controller.Model.UpdateActorIcon(actor, icons);

        this.setState({
            icons: icons,
        }, () => {
        });
    }

}
