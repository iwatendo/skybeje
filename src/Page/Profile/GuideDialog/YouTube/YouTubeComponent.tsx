import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../../Base/IndexedDB/Personal";

import GuideDialogController from "../GuideDialogController";
import StdUtil from "../../../../Base/Util/StdUtil";
import ImageInfo from "../../../../Base/Container/ImageInfo";
import { Order } from "../../../../Base/Container/Order";
import YouTubeUtil, { YouTubeOption } from "../../../../Base/Util/YouTubeUtil";


/**
 * プロパティ
 */
export interface YouTubeProp {
    controller: GuideDialogController;
    guide: Personal.Guide;
}

/**
 * ステータス
 */
export interface YouTubeStat {
    guide: Personal.Guide;
    dispStart: number;
    dispEnd: number;
}



export default class YouTubeComponent extends React.Component<YouTubeProp, YouTubeStat> {


    /**
     * コンストラクタ
     * @param props
     * @param context
     */
    constructor(props?: YouTubeProp, context?: any) {
        super(props, context);

        let guide = this.props.guide;
        let opt = JSON.parse(guide.embedstatus) as YouTubeOption;

        this.state = {
            guide: guide,
            dispStart: opt.start,
            dispEnd: opt.end
        };
    }


    /**
     * 
     */
    public GetOption(): YouTubeOption {
        let guide = this.state.guide;
        return JSON.parse(guide.embedstatus) as YouTubeOption;
    }


    /**
     * 
     * @param option 
     */
    public SetOption(opt: YouTubeOption) {

        if (!this.CanRepeat(opt)) {
            opt.loop = false;
        }

        let guide = this.state.guide;
        guide.embedstatus = JSON.stringify(opt)

        this.setState({
            guide: guide,
        });
    }


    /**
     * 
     */
    public render() {

        let url = YouTubeUtil.ToEmbedYouTubeUrlOpt(this.state.guide, false)
        let opt = this.GetOption();
        let last = opt.last;
        let starttime = this.ToTime(this.state.dispStart);
        let endtime = this.ToTime(this.state.dispEnd);
        let lasttime = this.ToTime(last);

        let canReprt = this.CanRepeat(opt);
        let dispRepertOn = (!opt.loop && canReprt);
        let dispRepertOff = (opt.loop && canReprt);

        return (
            <div className="sbj-guide-embed">
                <div className="sbj-guide-embed-title">
                    {opt.title}
                    <button className="mdl-button mdl-js-button mdl-js-ripple-effect sbj-guide-delete-button" onClick={this.onDeleteClick.bind(this)} >
                        <i className="material-icons">delete_forever</i>
                    </button>
                </div>
                <div>
                    <div className="sbj-guide-embed-left">
                        <iframe width="320" height="180" src={url} frameBorder="0" allowFullScreen></iframe>
                    </div>
                    <div className="sbj-guide-embed-right">
                        <div>
                            <span className="mdl-list__item-primary-content">
                                開始　{starttime}
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.start} onInput={this.onInputStartTime.bind(this)} onChange={this.onChangeStartTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <div>
                            <span className="mdl-list__item-primary-content">
                                終了　{endtime}　／（{lasttime}）
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.end} onInput={this.onInputEndTime.bind(this)} onChange={this.onChangeEndTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <span className="mdl-list__item-primary-content">
                            <button className="mdl-button mdl-js-button mdl-button--raised" hidden={!dispRepertOn} onClick={this.onRepeatOn.bind(this)} >
                                <i className="material-icons bottom">loop</i>
                                <span> Repeat OFF </span>
                            </button>
                            <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" hidden={!dispRepertOff} onClick={this.onRepeatOff.bind(this)} >
                                <i className="material-icons bottom">loop</i>
                                <span> Repeat ON   </span>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        );

    }


    /**
     * 
     * @param time 
     */
    private ToTime(time: number): string {
        let hour = Math.floor(time / 3600);
        time = time - hour * 3600;
        let min = Math.floor(time / 60);
        let sec = time - min * 60;
        return hour + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
    }


    /**
     * リピート設定可否有無
     * ※再生時間の範囲指定がされている場合はリピート不可とする
     */
    private CanRepeat(opt: YouTubeOption): boolean {
        return (opt.start === 0 && opt.end === opt.last);
    }


    /**
     * 「DELETE」クリック時処理
     * @param ev
     */
    private onDeleteClick(ev) {
        this.props.controller.ClearEmbedItem();
    }


    /**
     * 開始秒の変更
     * @param e
     */
    private onInputStartTime(e) {
        this.setState({
            dispStart: Number.parseInt(e.currentTarget.value)
        });
    }


    /**
     * 開始秒の変更
     * @param e 
     */
    private onChangeStartTime(e) {
        this.onInputStartTime(e);
        let opt = this.GetOption();
        opt.start = this.state.dispStart;
        if (opt.start > opt.end) {
            opt.end = opt.start;
            this.setState({ dispEnd: opt.end });
        }
        this.SetOption(opt);
    }


    /**
     * 終了秒の変更
     * @param e
     */
    private onInputEndTime(e) {
        this.setState({
            dispEnd: Number.parseInt(e.currentTarget.value)
        });
    }


    /**
     * 終了秒の変更
     * @param e 
     */
    private onChangeEndTime(e) {
        this.onInputEndTime(e);
        let opt = this.GetOption();
        opt.end = Number.parseInt(e.currentTarget.value);
        if (opt.start > opt.end) {
            opt.start = opt.end;
            this.setState({ dispStart: opt.start });
        }
        this.SetOption(opt);
    }


    /**
     * リピートボタン押下時（ON時)
     * @param event
     */
    private onRepeatOn(event) {
        let opt = this.GetOption();
        opt.loop = true;
        this.SetOption(opt);
    }


    /**
     * リピートボタン押下時（OFF時）
     * @param event
     */
    private onRepeatOff(event) {
        let opt = this.GetOption();
        opt.loop = false;
        this.SetOption(opt);
    }

}
