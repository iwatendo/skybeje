import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LinkUtil from "../../../Base/Util/LinkUtil";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import { ChatMessageSender } from "../HomeVisitorContainer";
import HomeVisitorController from "../HomeVisitorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import MobileDialog from "../Mobile/MobileDialog";
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
                <div className="sbj-cast-control">
                    <div className="sbj-cast-control-action mdl-card__actions">
                        <button className="mdl-button mdl-button--colored" onClick={this.OnLiveCastCkick.bind(this)}>
                            <i className="material-icons">contacts</i>
                            ライブキャスト
                        </button>
                        <button className="mdl-button mdl-button--colored" onClick={this.OnLiveCastMobileCkick.bind(this)}>
                            <i className="material-icons">android</i>
                            モバイル
                        </button>
                        <button className="mdl-button mdl-button--colored" hidden>
                            <i className="material-icons">library_books</i>
                            ガジェット（未実装）
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    /**
     * ライブキャストボタン押下時処理
     * @param e 
     */
    private OnLiveCastCkick(e) {
        let peerid = this.props.controller.PeerId;
        this.props.controller.NotifyLivecast(peerid);
    }


    /**
     * モバイルボタン押下時処理
     * @param e 
     */
    private OnLiveCastMobileCkick(e) {
        let peerid = this.props.controller.PeerId;

        let dialog = new MobileDialog(this.props.controller);
        let url = LinkUtil.CreateLink("../CastInstanceMobile/", this.props.controller.PeerId);
        dialog.Show(DialogMode.View, url, () => { });

    }

}
