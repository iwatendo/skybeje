
/// <reference path="../../../node_modules/@types/youtube/index.d.ts"/>

import StdUtil from "./StdUtil";
import Sender from "../Container/Sender";
import * as Youtube from "../../../node_modules/youtube";
import { Guide } from "../IndexedDB/Personal";
import LogUtil from "./LogUtil";

export interface OnCreateYouTubePlayer { (player: YT.Player): void }

export class YouTubeOption {
    constructor() {
        this.id = "";
        this.title = "";
        this.loop = false;
        this.start = -1;
        this.end = -1;
        this.last = 0;
    }
    id: string;
    title: string;
    loop: boolean;
    start: number;
    end: number;
    last: number;
}


/**
 * 
 */
export default class YouTubeUtil {

    public static Player: YT.Player = null;
    public static IsAPIReady: boolean = false;
    public static ApiReadyElementId: string;
    public static ElementId: string;

    /**
     * YouTubeのID部分を取得します
     * @param url
     */
    public static GetYouTubeID(url: string): string {

        let mat = url.match(/[\/?=]([a-zA-Z0-9\-\_]{11})[&\?]?/);

        if (mat != null && mat.length > 0)
            return mat[1];
        else
            return "";
    }


    /**
     * YouTubeのURLを取得します
     * @param id 
     */
    public static ToEmbedYouTubeURL(id: string) {
        if (id != null && id.length >= 0) {
            return "https://www.youtube.com/embed/" + id;
        }
        else {
            return "";
        }
    }


    /**
     * YouTubeの埋込URLに変換します
     * @param guide
     * @param isAutoPlay
     */
    public static ToEmbedYouTubeUrlOpt(guide: Guide, isAutoPlay: boolean): string {

        let result: string;

        if (guide !== null && guide.url) {

            result = guide.url;
            result += "?autoplay=" + (isAutoPlay ? "1" : "0");
            result += "&rel=0";

            let option = JSON.parse(guide.embedstatus) as YouTubeOption;

            let id = option.id;
            let loop = option.loop;
            let start = option.start;
            let end = option.end;

            if (start) {
                result += "&start=" + start;
            }

            if (end) {
                result += "&end=" + end;
            }

            if (id && loop) {
                result += "&loop=1&playlist=" + id;
            }
        }

        return result;
    }


    /**
     * 
     * @param elementid 
     */
    public static Initialize(apiReadyElement: string, elementid: string) {
        this.ApiReadyElementId = apiReadyElement;
        this.ElementId = elementid;
    }


    /**
     * 
     * @param opt 
     */
    public static LoadVideo(opt: YouTubeOption) {
        if (this.IsAPIReady) {
            this.Player.loadVideoById({ videoId: opt.id, startSeconds: opt.start, endSeconds: opt.end });
        }
    }


    /**
     * 
     * @param opt 
     */
    public static CueVideo(opt:YouTubeOption){
        if (this.IsAPIReady) {
            this.Player.cueVideoById({ videoId: opt.id, startSeconds: opt.start, endSeconds: opt.end });
        }
    }


    /**
     * YouTubePlayerを取得
     * @param option 
     * @param useControl 
     * @param callback 
     */
    public static GetPlayer(option: YouTubeOption, useControl: boolean, callback: OnCreateYouTubePlayer) {

        if (this.IsAPIReady) {
            this.CreatePlayer(option, useControl, callback);
        }
        else {

            document.getElementById(this.ApiReadyElementId).onclick = (e) => {
                YouTubeUtil.CreatePlayer(option, useControl, callback);
                YouTubeUtil.IsAPIReady = true;
            }

            let tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            let scriptTag = document.getElementsByTagName('script');

            let firstScriptTag = scriptTag[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }


    /**
     * YouTubePlayerを生成します
     * @param opt 
     * @param useControl 
     * @param callback 
     */
    public static CreatePlayer(opt: YouTubeOption, useControl: boolean, callback: OnCreateYouTubePlayer) {

        if (YouTubeUtil.Player) {
            YouTubeUtil.Player.destroy();
        }

        let options: YT.PlayerOptions = {
            height: 0,
            width: 0,
            videoId: opt.id,
            playerVars: {
                controls: (useControl ? YT.Controls.ShowLoadPlayer : YT.Controls.Hide),
                showinfo: YT.ShowInfo.Hide,
                rel: YT.RelatedVideos.Hide,
            },
            events: {
                onReady: (event: YT.PlayerEvent) => {
                    if (callback) {
                        callback((event as any).target);
                    }
                },
                onError: (err: YT.OnErrorEvent) => {
                    LogUtil.Error(null, "YouTube Api Error : " + err.data.toString());
                }
            }
        };

        YouTubeUtil.Player = new YT.Player(this.ElementId, options);
    }

}
