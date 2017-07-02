import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";

import { Order } from "../../../Base/Container/Order";
import ActorPeer from "../../../Base/Container/ActorPeer";

import HomeVisitorController from "../HomeVisitorController";
import { UseActorSender } from "../HomeVisitorContainer";

import ActorSelectorDialog from "./ActorSelectorDialog";
import ActorSelectorItemComponent from "./ActorSelectorItemComponent";
import ActorUnSelectedItemComponent from "./ActorUnSelectedItemComponent";



/**
 * 
 */
export interface ActorSelectorDialogProp {
    controller: HomeVisitorController;
    owner: ActorSelectorDialog;
    actors: Array<Personal.Actor>;
    useActor: UseActorSender;
}


/**
 * 
 */
export interface ActorSelectorDialogStat {
    actors: Array<Personal.Actor>;
    useActor: UseActorSender;
}


export default class ActorSelectorDialogComponent extends React.Component<ActorSelectorDialogProp, ActorSelectorDialogStat> {


    private _selectedActorId: string = '';


    /**
     * コンストラクタ
     * @param props 
     * @param context 
     */
    constructor(props?: ActorSelectorDialogProp, context?: any) {
        super(props, context);

        this._selectedActorId = props.useActor.CurrentAid;

        this.state = {
            actors: props.actors,
            useActor: props.useActor,
        };
    }

    /**
     * 描画処理
     */
    public render() {

        let key: number = 0;

        Order.Sort(this.state.actors);

        //  未選択アクターリスト
        let actorList = this.state.actors.filter((a) => !this.IsUseActor(a)).map((actor) => {
            return (<ActorUnSelectedItemComponent key={actor.aid} owner={this} actor={actor} />);
        });

        //  選択済みアクターリスト
        let actorList2 = this.state.actors.filter((a) => this.IsUseActor(a)).map((actor) => {
            let isSelect = (this._selectedActorId === actor.aid);
            return (<ActorSelectorItemComponent key={actor.aid} owner={this} actor={actor} isSelect={isSelect} />);
        });

        return (
            <div>
                <div className="sbj-dialog-actor-selecter-left">
                    <h5 className="sbj-dialog-actor-selector-list-title">未配置アクター</h5>
                    <div className="sbj-dialog-actor-selecter-list">
                        <ul className="mdl-list">
                            {actorList}
                        </ul>
                    </div>
                </div>
                <div className="sbj-dialog-actor-selecter-right">
                    <h5 className="sbj-dialog-actor-selector-list-title">配置済アクター</h5>
                    <div className="sbj-dialog-actor-selecter-list">
                        <ul className="mdl-list">
                            {actorList2}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * 選択済みのアクターか？
     */
    public IsUseActor(actor: Personal.Actor): boolean {
        return (this.state.useActor.ActorPeers.filter((a) => { return (a.actor.aid == actor.aid) }).length > 0);
    }


    /**
     * 使用するアクターの追加
     * @param actor 
     */
    public AppendUseActor(actor: Personal.Actor) {

        let useActor = this.state.useActor;

        if (useActor.ActorPeers.filter((ap) => { return (ap.actor.aid == actor.aid); }).length === 0) {

            let ap = new ActorPeer(actor, this.props.controller.PeerId);
            useActor.ActorPeers.push(ap);
            this.ChangeSelectActorId(ap.actor.aid);
        }
    }


    /**
     * 使用するアクターの削除
     * @param actor 
     */
    public RemoveUseActor(actor: Personal.Actor) {

        let useActor = this.state.useActor;
        useActor.ActorPeers = useActor.ActorPeers.filter((ap) => { return (ap.actor.aid !== actor.aid); });

        this.setState({
            useActor: useActor
        }, () => {
            //  選択中のアクターが削除された場合
            //  先頭データ（ユーザープロフィール）を選択状態にする
            if (useActor.CurrentAid === actor.aid) {
                this.ChangeSelectActorId(useActor.ActorPeers[0].actor.aid);
            }
            else {
                this.ChangeSelectActorId(useActor.CurrentAid);
            }
        }
        );
    }


    /**
     * アクター変更
     * @param aid 
     */
    public ChangeSelectActorId(aid: string) {
        this.props.controller.Model.GetActor(aid, (actor) => {
            this.ChangeSelectActor(actor);
        });
    }


    /**
     * アクターの選択
     */
    public ChangeSelectActor(actor: Personal.Actor) {
        this._selectedActorId = actor.aid;
        this.setState({
            actors: this.state.actors
        }, () => {
        });

        let useActor = this.state.useActor;
        useActor.CurrentAid = actor.aid;
        useActor.CurrentIid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);

        this.props.owner.SetUseActor(useActor);
    }


    /**
     * 
     * @param aid 
     */
    public OnSelectActor(aid: string) {
        this.props.owner.Done();
    }

}
