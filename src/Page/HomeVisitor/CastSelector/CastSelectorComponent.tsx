import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LinkUtil from "../../../Base/Util/LinkUtil";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";

import { ChatMessageSender } from "../HomeVisitorContainer";
import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import { CastSelectorItemComponent } from "./CastSelectorItemComponent";
import CastSelectorController from "./CastSelectorController";


/**
 * プロパティ
 */
export interface CastSelectorProp {
    controller: HomeVisitorController;
    owner: CastSelectorController;
    servants: Array<ServantSender>;
    select: string;
}


export default class CastSelectorComponent extends React.Component<CastSelectorProp, any> {


    /**
     * 
     */
    public render() {

        //  サーバントリスト
        let servantsList = this.props.servants.map((servant) => {
            let isSelect = (this.props.select === servant.servantPeerId);
            return (<CastSelectorItemComponent key={servant.servantPeerId} controller={this.props.controller} owner={this.props.owner} servant={servant} isSelect={isSelect} />);
        });

        return (
            <div>
                <div className="sbj-cast-selector">
                    {servantsList}
                </div>
            </div>
        );
    }

}
