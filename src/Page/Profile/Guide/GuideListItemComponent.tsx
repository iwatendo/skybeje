import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Contents/IndexedDB/Personal";

import LogUtil from "../../../Base/Util/LogUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { Order, IOrder } from "../../../Base/Container/Order";

import GuideListComponent from "./GuideListComponent";
import GuideListView from "./GuideListView";
import StdUtil from "../../../Base/Util/StdUtil";
import MessageUtil from '../../../Base/Util/MessageUtil';


/**
 * 
 */
export interface GuideListItemProp {
    owner: GuideListComponent;
    view: GuideListView;
    guide: Personal.Guide;
    isSelect: boolean;
}


/**
 * 
 */
export default class GuideListItemComponent extends React.Component<GuideListItemProp, any>{


    /**
     * 
     */
    public render() {

        let guide = this.props.guide;
        let id = guide.gid;

        if (guide === null) {
            return (<div></div>);
        }
        else {

            let guideCellClass = "sbj-guide-cell mdl-cell mdl-cell--6-col mdl-card mdl-shadow--4dp";
            let guideClass = (this.props.isSelect ? "sbj-guide-select" : "sbj-guide") + " mdl-card--expand";

            let notes = StdUtil.TextLineSplit(guide.note);
            let ln = 0;
            let dispNotes = notes.map(line => {

                let dispLine = MessageUtil.AutoLinkAnaylze(line).map((al) => {
                    if (al.isLink) {
                        let dispurl = decodeURI(al.msg);
                        return (
                            <span>
                                <a className="sbj-timeline-message-autolink" href={al.msg} target="_blank">{dispurl}</a>
                            </span>
                        );
                    }
                    else {
                        return (<span>{al.msg}</span>);
                    }
                });

                ln++;
                if (ln === notes.length) {
                    return (<span key={ln}>{dispLine}</span>);
                }
                else {
                    return (<span key={ln}>{dispLine}<br /></span>);
                }
            });


            return (
                <div className={guideCellClass} onClick={this.onClick.bind(this)} onDoubleClick={this.OnDoubleClick.bind(this)} draggable={true} onDragStart={this.OnDragStart.bind(this)} onDrop={this.OnDrop.bind(this)}>
                    <div className={guideClass} id={id}>
                        <div className="sbj-guide-list-item-keywaord">
                            {guide.keyword}
                        </div>
                        <div className="sbj-guide-list-item-note">
                            {dispNotes}
                        </div>
                    </div>
                </div>
            );
        }
    }


    /**
     * ガイド選択時イベント
     * @param evnet 
     */
    private onClick(evnet) {
        if (!this.props.isSelect) {
            this.props.owner.Select(this.props.guide.gid);
        }
    }


    /**
     * ダブルクリック時処理
     */
    private OnDoubleClick(event) {
        this.props.view.OnClickEditGuide(this.props.view);
    }


    /**
     * ガイドのドラッグ開始時処理
     */
    private OnDragStart(ev: DragEvent) {
        let json = JSON.stringify(this.props.guide);
        ev.dataTransfer.setData("text", json);
    }


    /**
     * ドロップ時イベント
     */
    private OnDrop(ev: DragEvent) {
        let text = ev.dataTransfer.getData("text");

        try {

            let dragGuide: Personal.Guide = JSON.parse(text);     //  移動元
            let dropGuide = this.props.guide;                     //  移動先

            if (dragGuide && dragGuide.gid) {
                let preList = this.props.owner.GetGuideList();
                let newList = Order.Swap(preList, dragGuide, dropGuide);
                this.props.owner.ChangeGuideOrder(newList);
            }

        } catch (e) {
            LogUtil.Warning(this.props.owner.props.controller, e);
        }
    }

}
