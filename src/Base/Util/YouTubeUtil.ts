
/// <reference path="../../../node_modules/@types/youtube/index.d.ts"/>

import * as JQuery from "jquery";

import StdUtil from "./StdUtil";
import Sender from "../Container/Sender";
import * as Youtube from "../../../node_modules/youtube";

interface OnYouTube { (player: YT.Player): void }


export class Guide extends Sender {

    constructor() {
        super("Guide");
    }

    guideid: number = 0;
    key: string = "";
    value: string = "";
    visible: boolean = true;
    isYouTube: boolean = false;
    start_time: number = 0;
    end_time: number = 0;
    loop: boolean = false;
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
     * YouTubeの埋込URLに変換します
     * @param id
     * @param isInputMode
     */
    public static ToEmbedYouTubeID(guide: Guide, isInputMode: boolean): string {

        if (guide === null || !guide.isYouTube)
            return "";

        let id = guide.value;

        if (id != null && id.length >= 0) {

            let url = "";

            url += "https://www.youtube.com/embed/" + id;
            url += "?autoplay=" + (isInputMode ? "1" : "0");
            url += "&rel=0";

            if (isInputMode) {
                if (guide.start_time >= 0) {
                    url += "&start=" + guide.start_time;
                }

                if (guide.end_time >= 0) {
                    url += "&end=" + guide.end_time;
                }

                if (guide.loop) {
                    url += "&loop=1&playlist=" + id;
                }
            }

            return url;
        }
        else {
            return "";
        }

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
            let tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }


    /**
     * プレイヤークラスを生成します
     */
    public static CreatePlayer() {

        let divid = 'youtube-player-' + StdUtil.CreateUuid();

        if (YouTubeUtil.Player)
            YouTubeUtil.Player.destroy();

        $("#youtube-player").empty().append("<div id='" + divid + "'></div>");


        let options = {
            height: 0,
            width: 0,
            videoId: YouTubeUtil.VideoID,
            playerVars: {},
            events: {
                'onReady': (event: YT.Events) => {
                    if (YouTubeUtil.Callback) {
                        YouTubeUtil.Callback((event as any).target);
                    }
                }
            }
        };

        YouTubeUtil.Player = new YT.Player(divid, options);

    }

}

function onYouTubeIframeAPIReady() {
    YouTubeUtil.IsAPIReady = true;
    YouTubeUtil.CreatePlayer();
}
