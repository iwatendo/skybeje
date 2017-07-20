import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Timeline from "../../../Base/IndexedDB/Timeline";

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";

import { UpdateTimelineSender } from "../../HomeInstance/HomeInstanceContainer";
import { ChatMessageSender } from "../HomeVisitorContainer";
import HomeVisitorController from "../HomeVisitorController";
import { TimelineMsgGroup } from "./TimelineComponent";


/**
 *  
 */
interface TimelineMsgItemProp {
    controller: HomeVisitorController;
    MsgGroup: TimelineMsgGroup;
}


export class TimelineMsgItemComponent extends React.Component<TimelineMsgItemProp, any> {


    /**
     *  描画処理
   　*/
    public render() {

        let aid = this.props.MsgGroup.aid;
        let iid = this.props.MsgGroup.iid;
        let isMine = this.IsMyChatMessage();

        let msgtext = this.props.MsgGroup.map((tlmsg) => {

            let mid = 'sbj-timeline-message-' + tlmsg.mid;
            let tmclass = "sbj-timeline-message" + (tlmsg.visible ? "" : " sbj-timeline-message-ignore");
            let icon = (tlmsg.visible ? "clear" : "undo");

            //  自分のメッセージの場合は削除ボタンを表示
            let button = (<span></span>);
            if (this.IsMyChatMessage()) {
                button = (
                    <button className='mdl-button mdl-js-button mdl-button--icon mdl-button--colored sbj-timeline-ignore' onClick={(e) => { this.OnIgnoreClick(tlmsg); }}>
                        <i className='material-icons' id={mid}>{icon}</i>
                    </button>
                );
            }

            let msgs = StdUtil.TextLineSplit(tlmsg.text);
            let ln = 0;
            let dispText = msgs.map(n => {

                ln += 1;
                let linkText = this.SetAutoLink(n);
                if (ln === msgs.length) {
                    return (<span key={ln}>{linkText}{button}</span>);
                }
                else {
                    return (<span key={ln}>{linkText}<br /></span>);
                }
            });

            return (
                <p key={tlmsg.mid} className={tmclass}>{dispText}</p>
            );
        });

        //
        let imgclassName = "sbj-timeline-img sbj-icon-img-" + iid.toString();


        //
        let image_div = (iid ? (<div className='sbj-timeline-img-box'><div className={imgclassName}></div></div>) : (<div></div>));

        //
        let msg_div = (
            <div className='sbj-timline-message-box'>
                {this.CreateNameTimeElement(this.props.MsgGroup[0], isMine)}
                <div className='sbj-timeline-balloon'>
                    {msgtext}
                </div>
            </div>
        );

        let spc_div = (<div className='sbj-timeline-adjust'></div>);

        if (isMine) {
            return (<div key="left" className='sbj-timeline-flex-left'>{image_div}{msg_div}{spc_div}</div>);
        }
        else {
            return (<div key="right" className='sbj-timeline-flex-right'>{spc_div}{msg_div}{image_div}</div>);
        }

    }

    /**
     * AutoLinkの設定
     * @param baseText
     */
    public SetAutoLink(baseText: string): JSX.Element {

        let linkArray = LinkUtil.AutoLinkAnaylze(baseText);

        let result = linkArray.map((al) => {
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

        return (<span>{result}</span>);
    }


    /**
     * 名前と発言時間のエレメントを生成
     * @param name 
     * @param datetime 
     * @param isMine 
     */
    public CreateNameTimeElement(msg: Timeline.Message, isMine: boolean): JSX.Element {

        let name = this.props.MsgGroup[0].name;
        let datetime = this.ToDispDate(this.props.MsgGroup[0].ctime);

        let namestyle = { float: (isMine ? "left" : "right") };

        if (isMine) {
            return (
                <div style={namestyle}>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                    <label>
                        {datetime}
                    </label>
                </div>
            );
        }
        else {
            return (
                <div style={namestyle}>
                    <label>
                        {datetime}
                    </label>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                </div>
            );
        }
    }


    /**
     * 日付の表示変換
     * @param date
     */
    public ToDispDate(value: number) {
        let date = new Date(value);
        return ("0" + (date.getMonth() + 1)).slice(-2)
            + "/" + ("0" + date.getDate()).slice(-2)
            + " " + ("0" + date.getHours()).slice(-2)
            + ":" + ("0" + date.getMinutes()).slice(-2);
    }


    /**
     * 
     */
    public IsMyChatMessage(): boolean {
        return (this.props.MsgGroup.aid === this.props.controller.CurrentAid);
    }


    /**
     * メッセージの「✕」ボタン押下時イベント
     * @param event
     */
    public OnIgnoreClick(tml: Timeline.Message) {

        tml.visible = !tml.visible;
        this.props.controller.UpdateTimeline(tml);

    }

}