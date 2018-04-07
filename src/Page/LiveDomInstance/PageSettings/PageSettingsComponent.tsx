import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";

import LiveDomInstanceController from '../LiveDomInstanceController';
import { PageSettings } from '../../../Contents/IndexedDB/LiveHTML';


/**
 * プロパティ
 */
export interface PageSettingsComponentProp {
    controller: LiveDomInstanceController;
    items: Array<PageSettings>;
}


/**
 * ステータス
 */
export interface PageSettingsComponentStat {
    selectItem: string;
}


/**
 * 
 */
export default class PageSettingsComponent extends React.Component<PageSettingsComponentProp, PageSettingsComponentStat> {


    private _selectedSetting: string = '';

    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: PageSettingsComponentProp, context?: any) {
        super(props, context);
    }


    public render() {

        let avatarstyle = {
            color: 'var(--sbj-color-default-text)',
            borderRadius: "0%",
            backgroundColor: "initial",
        };

        let itemsElement = this.props.items.map((ps) => {

            let liclass = "mdl-list__item";

            if (this.state && ps.pageId === this.state.selectItem) {
                liclass += " mdl-shadow--2dp";
            }

            return (
                <li className={liclass} onClick={this.OnClickItem.bind(this, ps)}>
                    <span className="mdl-list__item-secondary-action">
                        <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.OnClickSend.bind(this, ps)}>
                            送信
                        </button>
                    </span>
                    <span className="mdl-list__item-primary-content">
                        <span>{ps.pageName}</span>
                    </span>
                </li>
            );
        });


        return (
            <ul className="mdl-list">
                {itemsElement}
            </ul>
        );
    }


    /**
     * 選択行の変更
     * @param ps 
     * @param e 
     */
    public OnClickItem(ps: PageSettings, e) {

        this.props.controller.View.PageSettings.SetSelect(ps);

        this.setState({
            selectItem: ps.pageId
        });
    }


    /**
     * 送信ボタン押下時
     * @param ps 
     * @param e 
     */
    public OnClickSend(ps: PageSettings, e) {
        this.props.controller.View.SendLiveDom(ps);
    }

}
