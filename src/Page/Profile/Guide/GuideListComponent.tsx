import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";

import StdUtil from "../../../Base/Util/StdUtil";
import { Order } from "../../../Base/Container/Order";

import ProfileController from "../ProfileController";
import GuideListItemComponent from "./GuideListItemComponent";
import GuideListView from "./GuideListView";


/**
 * プロパティ
 */
export interface GuideListProp {
    controller: ProfileController;
    view: GuideListView;
    guides: Array<Personal.Guide>;
    selectGid: string;
}

/**
 * ステータス
 */
export interface GuideListStat {
    guides: Array<Personal.Guide>;
    selectGid: string;
}


export default class GuideListComponent extends React.Component<GuideListProp, GuideListStat> {

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: GuideListProp, context?: any) {
        super(props, context);

        this.state = {
            guides: this.props.guides,
            selectGid: this.props.selectGid,
        };

        this.Select(this.props.selectGid);
    }



    public render() {

        Order.Sort(this.state.guides);

        let guideNodes = this.state.guides.map((guide) => {

            let isSelect = (guide.gid === this.state.selectGid);
            return (<GuideListItemComponent key={guide.gid} owner={this} view={this.props.view} guide={guide} isSelect={isSelect} />);

        });

        return (
            <div className="sbj-profile-guides-view-main mdl-grid">
                {guideNodes}
            </div>
        );
    }


    /**
     * 選択ガイドの変更
     * @param guide 
     */
    public Select(gid:string) {
        this.setState({
            selectGid: gid
        });

        let canEdit = (gid);
        (document.getElementById('sbj-profile-edit-guide') as HTMLInputElement).disabled = !canEdit;
        (document.getElementById('sbj-profile-delete-guide') as HTMLInputElement).disabled = !canEdit;

        this.props.controller.SelectionGid = gid;
    }


    /**
     * ガイドリストの取得
     */
    public GetGuideList(): Array<Personal.Guide> {
        return this.state.guides;
    }


    /**
     * ガイドの並び順変更
     */
    public ChangeGuideOrder(guides: Array<Personal.Guide>) {

        let controller = this.props.controller;
        let actor = controller.Actor;

        actor.guideIds = new Array<string>();
        guides.forEach((guide) => {
            actor.guideIds.push(guide.gid);
        });

        this.props.controller.Model.UpdateActor(actor, () => { });

        this.setState({
            guides: guides,
        }, () => {
            guides.forEach(cur => {
                controller.Model.UpdateGuide(cur);
            });
        });
    }

}
