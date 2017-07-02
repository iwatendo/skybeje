import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";
import { ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import CastSelectorController from "./CastSelectorController";


/**
 *  
 */
interface TimelineMsgItemProp {
    controller: HomeVisitorController;
    owner: CastSelectorController;
    servant: ServantSender;
    isSelect: boolean;
}


export class CastSelectorItemComponent extends React.Component<TimelineMsgItemProp, any> {


    /**
     *  描画処理
   　*/
    public render() {

        let typeclass = "sbj-cast-selector-type" + (this.props.isSelect ? " sbj-cast-select" : "");

        let servant = this.props.servant;
        let imgclassName = "sbj-cast-selector-img sbj-icon-img-" + servant.ownerIid + (this.props.isSelect ? " mdl-shadow--4dp" : "");
        this.props.controller.IconCache.GetIcon(servant.ownerPeerid, servant.ownerIid);

        let mobileMark = (<div></div>);
        if (servant.instanceUrl.indexOf('mobile') > 0) {
            mobileMark = (
                <i className="sbj-cast-selector-mobile-mark material-icons">android</i>
            );
        }

        return (
            <div>
                <div className={typeclass}>
                    ON AIR
                </div>
                <div className="sbj-cast-selector-img-box" onClick={this.OnSelect.bind(this)}>
                    <div className={imgclassName}>
                        {mobileMark}
                    </div>
                </div>
            </div>
        );

    }


    /**
     * 選択時イベント
     * @param e 
     */
    private OnSelect(e) {
        this.props.owner.ChangeDispServant(this.props.servant);
    }

}
