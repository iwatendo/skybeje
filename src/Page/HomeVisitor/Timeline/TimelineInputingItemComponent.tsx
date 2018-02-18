import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";
import ChatInfoSender from '../../../Contents/Sender/ChatInfoSender';


/**
 *  
 */
interface TimelineInputingItemProp {
    controller: HomeVisitorController;
    chatInputing: ChatInfoSender;
}


export class TimelineInputingItemComponent extends React.Component<TimelineInputingItemProp, any> {


    /**
     *  描画処理
   　*/
    public render() {

        let aid = this.props.chatInputing.aid;
        let iid = this.props.chatInputing.iid;
        let isMine = this.IsMyChatMessage();

        //
        let image_div = (iid ? (<div className='sbj-timeline-img-box'><div className='sbj-timeline-img-empty'></div></div>) : (<div></div>));

        //
        let msg_div = (
            <div className='sbj-timline-message-box'>
                {this.CreateNameTimeElement(this.props.chatInputing, isMine)}
                <div className='sbj-timeline-inputing-balloon'>
                    <p key={aid} className='sbj-timeline-message'>・・入力中・・</p>
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
     * 名前と発言時間のエレメントを生成
     * @param name 
     * @param datetime 
     * @param isMine 
     */
    public CreateNameTimeElement(cis: ChatInfoSender, isMine: boolean): JSX.Element {

        let name = this.props.chatInputing.name;

        let namestyle = { float: (isMine ? "left" : "right") };

        if (isMine) {
            return (
                <div style={namestyle}>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                </div>
            );
        }
        else {
            return (
                <div style={namestyle}>
                    <label className='sbj-timeline-name'>
                        {name}
                    </label>
                </div>
            );
        }
    }


    /**
     * 
     */
    public IsMyChatMessage(): boolean {
        return (this.props.chatInputing.aid === this.props.controller.CurrentAid);
    }

}