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
    isPlay: boolean;
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
            isPlay: false,
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

        let opt = this.GetOption();
        let last = opt.last;
        let starttime = this.ToTime(opt.start);
        let endtime = this.ToTime(opt.end);

        let canRepeat = this.CanRepeat(opt);
        let dispRepertOn = (!opt.loop && canRepeat);
        let dispRepertOff = (opt.loop && canRepeat);

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
                        <div id="sbj-guide-youtube-player"></div>
                    </div>
                    <div className="sbj-guide-embed-right">
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
                        <div>
                            <span className="mdl-list__item-primary-content">
                                開始　{starttime} &nbsp;
                                <button className="mdl-button mdl-js-button mdl-button--colored" onClick={this.onSetStartTime.bind(this)} >
                                    <i className="material-icons bottom">chevron_right</i>
                                    &nbsp;ここから&nbsp;
                                </button>
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.start} onInput={this.onInputStartTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <div>
                            <span className="mdl-list__item-primary-content">
                                終了　{endtime} &nbsp;
                                <button className="mdl-button mdl-js-button mdl-button--colored" onClick={this.onSetEndTime.bind(this)} >
                                    <i className="material-icons bottom">chevron_left</i>
                                    &nbsp;ここまで&nbsp;
                                </button>
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.end} onInput={this.onInputEndTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <span className="mdl-list__item-primary-content">
                            <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" hidden={canRepeat} onClick={this.onPlay.bind(this)} >
                                <i className="material-icons bottom">play_circle_outline</i>
                                &nbsp;再生テスト&nbsp;
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

        let mili = time - Math.floor(time);
        time = Math.floor(time);

        let hour = Math.floor(time / 3600);
        time = time - hour * 3600;
        let min = Math.floor(time / 60);
        let sec = time - min * 60;
        return hour + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2) + "." + ("00" + Math.round(mili * 1000)).slice(-3);
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
     * 
     * @param event 
     */
    private onSetStartTime(event) {
        this.SetStartTime(YouTubeUtil.Player.getCurrentTime());
    }


    /**
     * 
     * @param e
     */
    private onInputStartTime(e) {
        this.SetStartTime(Number.parseInt(e.currentTarget.value));
    }


    /**
     * 
     * @param start 
     */
    private SetStartTime(start: number) {
        let opt = this.GetOption();
        opt.start = Math.round(start * 1000) / 1000;
        if (opt.start > opt.end) {
            opt.end = opt.start;
        }
        this.SetOption(opt);
    }


    /**
     * 
     * @param event 
     */
    private onSetEndTime(event) {
        this.SetEndTime(YouTubeUtil.Player.getCurrentTime());
    }


    /**
     * 
     * @param e
     */
    private onInputEndTime(e) {
        this.SetEndTime(Number.parseInt(e.currentTarget.value));
    }


    /**
     * 
     * @param e
     */
    private SetEndTime(end: number) {
        let opt = this.GetOption();
        opt.end = Math.round(end * 1000) / 1000;
        if (opt.start > opt.end) {
            opt.start = opt.end;
        }
        this.SetOption(opt);
    }


    /**
     * 再生テスト
     * @param e 
     */
    private onPlay(e) {
        YouTubeUtil.LoadVideo(this.GetOption());
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
