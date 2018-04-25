import * as React from 'react';
import * as ReactDOM from 'react-dom';

import StdUtil from "../../../Base/Util/StdUtil";

import LiveHTMLInstanceController from '../LiveHTMLInstanceController';
import { PageSettings } from '../../../Contents/IndexedDB/LiveHTML';


/**
 * プロパティ
 */
export interface PageSettingsComponentProp {
    controller: LiveHTMLInstanceController;
    items: Array<PageSettings>;
    selectItem: string;
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


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: PageSettingsComponentProp, context?: any) {
        super(props, context);
    }


    public render() {

        let itemsElement = this.props.items.map((ps) => {

            let isSelect = this.IsSelectPage(ps);
            let isLive = this.IsLivePage(ps);
            let hasTag = (ps.pageTag.trim().length > 0);

            let liclass = "sbj-list-item mdl-list__item" + (hasTag ? " mdl-list__item--two-line" : "") + (isSelect ? " sbj-list-item-select mdl-shadow--2dp" : "");
            let subTitle = (hasTag ? <span className="mdl-list__item-sub-title">{ps.pageTag}</span> : <span></span>);
            let buttonclass = "mdl-button mdl-js-button mdl-button--colored" + (isLive ? " mdl-button--raised" : "");
            let buttonName = (isLive ? "配信先に表示" : "配信先に表示");

            return (
                <li className={liclass} onClick={this.OnClickItem.bind(this, ps)} onDoubleClick={this.OnDoubleClickItem.bind(this, ps)}>
                    <span className="mdl-list__item-primary-content">
                        <span>{ps.pageName}</span>
                        {subTitle}
                    </span>
                    <span className="mdl-list__item-secondary-action">
                        <button className={buttonclass} onClick={this.OnClickSend.bind(this, ps)}>
                            {buttonName}
                        </button>
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
     * 選択しているページ設定か？
     * @param id 
     */
    public IsSelectPage(ps: PageSettings): boolean {

        let view = this.props.controller.View;
        if (view && view.PageSettings) {

            let selps = view.PageSettings.GetSelect();
            return (ps.pageId === selps.pageId);
        }
        else {
            return false;
        }
    }


    /**
     * ライブ中のページか？
     * @param ps 
     */
    public IsLivePage(ps: PageSettings): boolean {
        let view = this.props.controller.View;
        if (view && view.LiveHTML) {
            return (ps.pageId === view.LiveHTML.pageId);
        }
        else {
            return false;
        }
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
     * 行選択
     * @param ps 
     * @param e 
     */
    public OnDoubleClickItem(ps: PageSettings, e) {
        this.OnClickItem(ps, e);
        this.props.controller.View.PageSettings.OnClickPageEdit();
    }


    /**
     * 「配信先に表示」ボタン押下時
     * @param ps 
     * @param e 
     */
    public OnClickSend(ps: PageSettings, e) {
        this.props.controller.View.SendLiveHTML(ps);
    }

}
