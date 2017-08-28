
import * as Home from "../../Base/IndexedDB/Home";
import * as Personal from "../../Base/IndexedDB/Personal";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import GadgetInstanceController from "./GadgetInstanceController";
import { GadgetCastSettingSender, YouTubeStatusSender } from "./GadgetInstanceContainer";
import YouTubeUtil, { YouTubeOption } from "../../Base/Util/YouTubeUtil";
import LogUtil from "../../Base/Util/LogUtil";

export default class GadgetInstanceView extends AbstractServiceView<GadgetInstanceController> {

    private _mainElement = document.getElementById("sbj-gadget-instance-main");

    private YouTubeOption: YouTubeOption = null;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchmove();
        let backpanel = document.getElementById('sbj-gadget-instance');
        let startButton = document.getElementById('sbj-gadget-instance-start');
        let cancelButton = document.getElementById('sbj-gadget-instance-cancel');
        let stopButton = document.getElementById('sbj-gadget-instance-stop');
        let pauseButton = document.getElementById('sbj-gadget-instance-pause');
        let pauseRestart = document.getElementById('sbj-gadget-instance-restart');
        let roomName = document.getElementById('sbj-livecast-room-name');
        let accountCount = document.getElementById('sbj-gadget-instance-account-count');

        //
        backpanel.onclick = (e: MouseEvent) => {
            let targetClassName = (e.target as any).className;
            if (targetClassName === "mdl-layout__container") {
                this.Close();
            }
        };

        window.onfocus = (ev) => {
            this.Controller.CastInstance.isHide = false;
        }

        //  キャンセルボタン押下時
        cancelButton.onclick = (e) => {
            this.Close();
        };

        //  キー入力時イベント
        document.onkeydown = (e) => {
            //  エスケープキーはダイアログを閉じる
            if (e.keyCode === 27) {
                this.Close();
            }
        }

        //  停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.ServerSend(false, true);
        };

        let options = LocalCache.GadgetCastOptions;

        //  カーソル表示有無
        let cursorDispElement = document.getElementById('cursor_disp') as HTMLInputElement;
        cursorDispElement.onchange = (e) => {

            let isCheced = cursorDispElement.checked;
            LocalCache.SetGadgetCastOptions((opt) => opt.IsIconCursor = isCheced);

            this.Controller.CastSetting.dispUserCursor = isCheced;
            this.Controller.SendCastInfo();
        };
        cursorDispElement.checked = options.IsIconCursor;
        this.Controller.CastSetting.dispUserCursor = options.IsIconCursor;

        YouTubeUtil.Initialize("sbj-youtube-api-ready", "sbj-guide-youtube-player");

        callback();
    }

    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-gadget-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoom(room: Home.Room) {
        let message = "「" + room.name + "」に\nガジェットキャストしています";
        document.getElementById("sbj-livecast-room-name").innerText = message;
    }


    /**
     * ガジェット情報の設定
     * @param guide 
     */
    public SetGuide(guide: Personal.Guide) {

        let opt = JSON.parse(guide.embedstatus) as YouTubeOption;
        this.YouTubeOption = opt;

        YouTubeUtil.GetPlayer(opt, true, (player) => {
            this.SetYouTubeListener(player);
            //  YouTubeUtil.CueVideo(opt);
            YouTubeUtil.LoadVideo(opt);
            this.Controller.CastSetting.guide = guide;
            this.Controller.ServerSend(true, false);
        });
    }


    /**
     * フレームを閉じる
     */
    public Close() {
        //  ストリーミング中の場合は表示を切替える
        this.Controller.CastInstance.isHide = this.Controller.CastInstance.isCasting;

        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastInstance.isClose = !this.Controller.CastInstance.isCasting;
        this.Controller.SendCastInfo();
    }


    /**
     * YouTubePlayerの再生ステータスの変更検知リスナーの登録
     * @param player 
     */
    private SetYouTubeListener(player: YT.Player) {

        player.addEventListener('onStateChange', (event) => {
            let state = ((event as any).data) as YT.PlayerState;
            this.SendYouTubeStatus(state, player.getPlaybackRate(), player.getCurrentTime());
        });

        player.addEventListener('onPlaybackRateChange', (event) => {
            let rate = ((event as any).data) as number;
            this.SendYouTubeStatus(player.getPlayerState(), rate, player.getCurrentTime());
        });
    }


    /**
     * YouTube動画の再生状況を取得する
     * ※途中接続のVisitorへ再生状況を伝えるための処理
     */
    public CreateYouTubeStatus(): YouTubeStatusSender {
        let pl = YouTubeUtil.Player;
        let sender = new YouTubeStatusSender();
        sender.pid = this.Controller.PeerId;
        sender.state = pl.getPlayerState();
        sender.playbackRate = pl.getPlaybackRate();
        sender.current = pl.getCurrentTime();
        return sender;
    }


    /**
     * YouTubeの再生状況の変更を
     * 接続クライアントに通知する
     */
    private SendYouTubeStatus(state: YT.PlayerState, pbr: number, curtime: number) {

        switch (state) {
            case YT.PlayerState.PLAYING: break;
            case YT.PlayerState.ENDED: break;
            case YT.PlayerState.PAUSED: break;
            case YT.PlayerState.CUED: break;
            case YT.PlayerState.UNSTARTED: return;
            default: return;
        }

        //  通知情報の生成
        let sender = new YouTubeStatusSender();
        sender.pid = this.Controller.PeerId;
        sender.state = state;
        sender.playbackRate = pbr;
        sender.current = curtime;
        sender.isSyncing = true;

        //  接続クライアントに通知
        this._preSender = sender;
        WebRTCService.SendAll(sender);
    }

    private _preSender = null;

    /**
     * 接続クライアントからのステータス通知の取得
     * @param sender 
     */
    public SetYouTubeStatus(sender: YouTubeStatusSender) {

        if (this._preSender === null) return;
        if (YouTubeStatusSender.IsEqual(this._preSender, sender)) return;

        let pl = YouTubeUtil.Player;

        if( pl.getPlaybackRate() !== sender.playbackRate ){
            pl.setPlaybackRate(sender.playbackRate);
        }

        switch (sender.state) {
            case YT.PlayerState.PLAYING:
                pl.playVideo();
                break;
            case YT.PlayerState.ENDED:
                //  pl.stopVideo();
                break;
            case YT.PlayerState.PAUSED:
                pl.pauseVideo();
                pl.seekTo(sender.current, true);
                break;
            case YT.PlayerState.CUED:
                break;
            case YT.PlayerState.UNSTARTED: return;
            default: return;
        }

        WebRTCService.SendAll(sender);
    }

}
