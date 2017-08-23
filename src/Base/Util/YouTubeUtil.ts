
/// <reference path="../../../node_modules/@types/youtube/index.d.ts"/>

import * as JQuery from "jquery";

import StdUtil from "./StdUtil";
import Sender from "../Container/Sender";
import * as Youtube from "../../../node_modules/youtube";
import { Guide } from "../IndexedDB/Personal";

interface OnYouTube { (player: YT.Player): void }

export class YouTubeOption {
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

    public static Player: YT.Player;
    public static VideoID: string;
    public static Callback: OnYouTube;
    public static IsAPIReady: boolean = false;

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
     * YouTubePlayerクラスを取得します
     * @param videoid
     * @param onYouTube
     */
    public static GetPlayer(videoid: string, onYouTube: OnYouTube) {

        this.VideoID = videoid;
        this.Callback = onYouTube;

        if (this.IsAPIReady) {
            this.CreatePlayer();
        }
        else {

            document.getElementById("sbj-youtube-api-ready").onclick = (e) => {
                YouTubeUtil.IsAPIReady = true;
                YouTubeUtil.CreatePlayer();
            }

            let tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            let scriptTag = document.getElementsByTagName('script');

            let firstScriptTag = scriptTag[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }


    /**
     * プレイヤークラスを生成します
     */
    public static CreatePlayer() {

        let divid = 'youtube-player-' + StdUtil.CreateUuid();

        if (YouTubeUtil.Player) {
            YouTubeUtil.Player.destroy();
        }

        let element = document.getElementById('youtube-player');
        element.innerHTML = "<div id='" + divid + "'></div>";

        let options: YT.PlayerOptions = {
            height: 0,
            width: 0,
            videoId: YouTubeUtil.VideoID,
            events: {
                onReady: (event: YT.PlayerEvent) => {
                    if (YouTubeUtil.Callback) {
                        YouTubeUtil.Callback((event as any).target);
                    }
                }
            }
        };

        YouTubeUtil.Player = new YT.Player(divid, options);

    }

}
