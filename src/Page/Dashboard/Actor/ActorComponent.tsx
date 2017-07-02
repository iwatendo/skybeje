import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DialogMode } from "../../../Base/Common/AbstractDialogController";
import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";
import * as Personal from "../../../Base/IndexedDB/Personal";
import ActorItemComponent from "./ActorItemComponent";
import ActorIconListComponent from "./ActorIconListComponent";
import ActorEditDialogController from "./ActorEditDialog/ActorEditDialogController";
import ActorView from "./ActorView";
import { DragAction } from "../INaviContainer";
import DashboardController from "../DashboardController";


/**
 * プロパティ
 */
export interface ActorProp {
    controller: DashboardController;
    view: ActorView;
    actors: Array<Personal.Actor>;
    icons: Array<Personal.Icon>;
}


/**
 * 
 */
export interface ActorStat {
    actors: Array<Personal.Actor>;
    icons: Array<Personal.Icon>;
}


export default class ActorComponent extends React.Component<ActorProp, ActorStat> {


    private _selectedActor: string = '';

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: ActorProp, context?: any) {
        super(props, context);

        this.state = {
            actors: props.actors,
            icons: props.icons,
        };

        if (this.props.actors.length > 0) {
            Order.Sort(this.props.actors);
            this._selectedActor = this.props.actors[0].aid;
        }
    }


    public render() {

        this.state.actors.sort((a, b) => (a.order - b.order));

        let actorListNodes = this.state.actors.map((actor) => {
            let isSelect = (this._selectedActor === actor.aid);
            return (<ActorItemComponent key={actor.aid} owner={this} actor={actor} isSelect={isSelect} />);
        });

        let actor: Personal.Actor = this.state.actors.find((n) => (n.aid === this._selectedActor));
        let icons: Array<Personal.Icon> = this.GetIconList(actor);
        let key = (actor ? actor.aid : '');

        let actorNode = (<ActorIconListComponent key={key} owner={this} actor={actor} icons={icons} />);

        return (
            <div className="sbj-split">

                <div className="sbj-split-left">
                    <div className="mdl-card__supporting-text">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored" onClick={this.OnClick_AddActor.bind(this)}>
                            <i className='material-icons'>add</i>
                            &nbsp;アクターの追加&nbsp;
                        </button>
                        <ul className="mdl-list">
                            {actorListNodes}
                        </ul>
                    </div>
                </div>

                <div className="sbj-split-right">
                    {actorNode}
                </div>

            </div>
        );
    }


    /**
     * アクターの追加
     */
    public OnClick_AddActor(event) {
        let prop = this.props;

        let newActor = new Personal.Actor();
        newActor.name = "";
        newActor.aid = StdUtil.CreateUuid();
        newActor.order = Order.New(this.state.actors);

        let dialog = new ActorEditDialogController(null);
        dialog.Title = "アクターの追加";

        dialog.Show(DialogMode.Append, newActor, (actor) => {
            this.props.controller.Model.UpdateActor(actor);
            this.state.actors.push(actor);
            this.SelectActor(actor);
        });

    }


    /**
     * アクターの選択
     */
    public SelectActor(actor: Personal.Actor) {
        this._selectedActor = actor.aid;
        let icons: Array<Personal.Icon> = this.GetIconList(actor);
        this.setState({ actors: this.state.actors }, () => {
            this.props.view.SetIconCss(icons);
        });
    }


    /**
     * アクターの削除処理
     */
    public DeleteActor(actor: Personal.Actor) {
        this.setState({
            actors: this.state.actors.filter((n) => n.aid !== actor.aid),
        });
        this.props.controller.Model.DeleteActorIcon(actor);
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
     * 
     */
    public UpdateIcon(icon: Personal.Icon) {
        this.props.controller.Model.UpdateIcon(icon);
    }


    /**
     * アイコンの削除処理
     */
    public DeleteIcon(icon: Personal.Icon) {

        this.setState({
            icons: this.state.icons.filter((n) => n.iid !== icon.iid),
        });

        this.props.controller.Model.DeleteIcon(icon);
    }


    /**
     * アイコンデータの差替
     */
    public ChangeIcons(actor: Personal.Actor, icons: Array<Personal.Icon>) {

        let newIconList = this.GetIconList(actor);
        icons.forEach(icon => newIconList.push(icon));

        this.setState({
            icons: newIconList,
        });
    }


    /**
     * アイコンリストの取得
     * @param actor 
     */
    public GetIconList(actor: Personal.Actor): Array<Personal.Icon> {

        let result = new Array<Personal.Icon>();

        if (actor) {
            actor.iconIds.forEach((iid) => {
                this.state.icons.filter(n => n.iid === iid).forEach(m => result.push(m));
            });
        }

        return result;

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
