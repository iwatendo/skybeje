import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Base/IndexedDB/Personal";
import StdUtil from "../../../Base/Util/StdUtil";
import ImageDialogController from "../ImageDialogController";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order } from "../../../Base/Container/Order";
import { IIConOwner } from "../Icon/IIConOwner";
import IconComponent from "../Icon/IconComponent";
import ActorComponent from "./ActorComponent";
import ActorView from "./ActorView";


/**
 * プロパティ
 */
export interface ActorIconListProp {
    owner: ActorComponent;
    actor: Personal.Actor;
    icons: Array<Personal.Icon>;
}


/**
 * ステータス
 */
export interface ActorIconListStat {
    actor: Personal.Actor;
    icons: Array<Personal.Icon>;
}


export default class ActorIconListComponent extends React.Component<ActorIconListProp, ActorIconListStat> implements IIConOwner {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ActorIconListProp, context?: any) {
        super(props, context);

        this.state = {
            actor: props.actor,
            icons: props.icons,
        };

        this.props.owner.SetDragFromOutsideAction(() => {
            this.OnClick_AddIcon(null)
        });
    }



    public render() {

        if (!this.state.actor) {
            return (<div></div>);
        }

        Order.Sort(this.state.icons);

        let iconNodes = this.state.icons.map((icon) => {
            return (<IconComponent key={icon.iid} owner={this} icon={icon} />);
        });

        return (
            <div className="mdl-grid">
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
     * アイコン追加時
     */
    public OnClick_AddIcon(event) {
        let prop = this.props;
        ImageDialogController.Append((img) => this.OnImage_Append(prop, img));
    }


    /**
     * 
     */
    public OnImage_Append(prop: ActorIconListProp, imageRec: ImageInfo) {

        let icon = new Personal.Icon();
        icon.iid = StdUtil.CreateUuid();
        icon.order = Order.New(this.state.icons);
        icon.img = imageRec;

        this.state.actor.iconIds.push(icon.iid);

        let icons = this.state.icons;
        icons.push(icon);

        this.setState({
            actor: this.state.actor,
            icons: icons,
        }, () => {
            prop.owner.state.icons.push(icon);
            prop.owner.UpdateActor(this.state.actor);
            prop.owner.UpdateIcon(icon);
        });
    }


    /**
     * 
     */
    public UpdateIcon(icon: Personal.Icon) {
        this.props.owner.UpdateIcon(icon);
    }


    /**
     * アイコンの削除処理
     */
    public DeleteIcon(icon: Personal.Icon) {

        this.state.actor.iconIds = this.state.actor.iconIds.filter(iid => iid !== icon.iid);

        this.setState({
            actor: this.state.actor,
            icons: this.state.icons.filter(n => n.iid !== icon.iid),
        }, () => {
            this.props.owner.UpdateActor(this.state.actor);
            this.props.owner.DeleteIcon(icon);
        })
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

        this.props.owner.UpdateActor(this.state.actor);

        this.setState({
            actor: this.state.actor,
            icons: icons,
        }, () => {
            this.state.icons.forEach(cur => {
                this.props.owner.UpdateIcon(cur);
            }, () => {
                this.props.owner.ChangeIcons(this.state.actor, icons);
            });
        });
    }

}
