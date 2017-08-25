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
                        <div id="sbj-guide-youtube-player"></div>
                    </div>
                    <div className="sbj-guide-embed-right">
                        <div>
                            <span className="mdl-list__item-primary-content">
                                開始　{starttime}
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.start} onInput={this.onInputStartTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <div>
                            <span className="mdl-list__item-primary-content">
                                終了　{endtime}　／（{lasttime}）
                                <input className="mdl-slider mdl-js-slider" type="range" min="0" max={last} value={opt.end} onInput={this.onInputEndTime.bind(this)}>
                                </input>
                            </span>
                        </div>
                        <span className="mdl-list__item-primary-content">

                            <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onClick={this.onPlay.bind(this)} >
                                <i className="material-icons bottom">play_arrow</i>
                                <span> Play </span>
                            </button>

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
        let opt = this.GetOption();
        opt.start = Number.parseInt(e.currentTarget.value);
        if (opt.start > opt.end) {
            opt.end = opt.start;
        }
        this.SetOption(opt);
    }


    /**
     * 終了秒の変更
     * @param e
     */
    private onInputEndTime(e) {
        let opt = this.GetOption();
        opt.end = Number.parseInt(e.currentTarget.value);
        if (opt.start > opt.end) {
            opt.start = opt.end;
        }
        this.SetOption(opt);
    }


    /**
     * 
     */
    private onPlay(e) {

        let player = YouTubeUtil.Player;
        let opt = this.GetOption();

        player.cueVideoById(opt.id, opt.start);
        player.

        player.addEventListener("onStateChange", (ev) => {

            let status = (ev as any).data;

            if(status === YT.PlayerState.CUED){
                YouTubeUtil.Player.playVideo();
            }

        })
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
