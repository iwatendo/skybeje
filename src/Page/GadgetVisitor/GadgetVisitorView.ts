
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import WebRTCService from "../../Base/Common/WebRTCService";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import YouTubeUtil, { YouTubeOption, OnCreateYouTubePlayer } from "../../Base/Util/YouTubeUtil";
import GadgetVisitorController from "./GadgetVisitorController";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import { CastSettingSender } from "../CastInstance/CastInstanceContainer";
import { Icon } from "../../Base/IndexedDB/Personal";
import { DialogMode } from "../../Base/Common/AbstractDialogController";
import { CursorController } from "../CastVisitor/Cursor/CurosrController";
import { GadgetCastSettingSender, GetYouTubeStatusSender, YouTubeStatusSender } from "../GadgetInstance/GadgetInstanceContainer";


/**
 * 
 */
export class GadgetVisitorView extends AbstractServiceView<GadgetVisitorController> {

    public Cursor: CursorController;
    private YouTubeOption: YouTubeOption = null;


    //
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();

        let submenuMain = document.getElementById('sbj-cast-visitor-submenu');
        submenuMain.onmouseover = (e) => {
            submenuMain.style.opacity = "1.0";
        }

        submenuMain.onmouseout = (e) => {
            submenuMain.style.opacity = "0.0";
        }

        YouTubeUtil.Initialize("sbj-youtube-api-ready", "sbj-guide-youtube-player");

        callback();
    }


    /**
     * ビデオ表示設定
     */
    public initializeCursor() {

        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-gadget-visitor-item-port') as HTMLElement;

        //  let curport = document.getElementById('sbj-gadget-visitor-cursor-port') as HTMLElement;
        //  this.Cursor = new CursorController(this.Controller.ConnCache, video, itemport, curport);
        //  this.Cursor.DisplayAll();
    }


    /**
     * ライブキャストの設定変更
     * @param sender
     */
    public SetGadgetSetting(sender: GadgetCastSettingSender) {

        if (this.Cursor) {
            if (sender.dispUserCursor) {
                this.Cursor.ClearQueue();
            }
            else {
                this.Cursor.Clear();
            }
        }

        let option = JSON.parse(sender.guide.embedstatus) as YouTubeOption;

        if (this.YouTubeOption === null || this.YouTubeOption.id !== option.id) {

            this.YouTubeOption = option;

            if(this._isLoaded){
                YouTubeUtil.LoadVideo(option);
            }
            else{
                this.SetYouTubePlayer(option, sender.status);
            }
        }
    }


    private _isLoaded: boolean = false;


    /**
     * 
     * @param ytOpt 
     * @param ytStatus 
     */
    public SetYouTubePlayer(ytOpt: YouTubeOption, ytStatus: YouTubeStatusSender) {

        YouTubeUtil.GetPlayer(ytOpt, false, (player) => {
            //  クライアント側は音がなる状態で起動
            player.unMute();
            player.seekTo(ytStatus.current, true);

            //  初期化処理
            this._isLoaded = true;
            this.SetYouTubeListener(player);
            this.SetYouTubeStatus(ytStatus);
        });
    }


    /**
     * YouTubePlayerの再生ステータスの変更検知リスナーの登録
     * @param player 
     */
    private SetYouTubeListener(player: YT.Player) {

        player.addEventListener('onStateChange', (event) => {
            let state = ((event as any).data) as YT.PlayerState;

            switch (state) {
                case YT.PlayerState.PLAYING: break;
                case YT.PlayerState.ENDED: break;
                case YT.PlayerState.PAUSED: break;
                case YT.PlayerState.BUFFERING: break;
                case YT.PlayerState.CUED: break;
                default: return;
            }

            this.SendYouTubeStatus(state, player.getPlaybackRate(), player.getCurrentTime());
        });

        player.addEventListener('onPlaybackRateChange', (event) => {
            let rate = ((event as any).data) as number;
            this.SendYouTubeStatus(player.getPlayerState(), rate, player.getCurrentTime());
        });

    }


    /**
     * YouTubeの再生状況の変更を
     * オーナーに通知する
     */
    private SendYouTubeStatus(state: YT.PlayerState, pbr: number, curtime: number) {

        //  通知情報の生成
        let sender = new YouTubeStatusSender();
        sender.pid = this.Controller.PeerId;
        sender.state = state;
        sender.playbackRate = pbr;
        sender.current = curtime;

        //  オーナーに通知する
        WebRTCService.SendToOwner(sender);
    }


    /**
     * オーナーからのYouTube再生通知
     * @param sender 
     */
    public SetYouTubeStatus(sender: YouTubeStatusSender) {

        if (!this._isLoaded)
            return;

        if (sender.pid === this.Controller.PeerId) {
            return;
        }

        let pl = YouTubeUtil.Player;

        if (pl.getPlaybackRate() !== sender.playbackRate) {
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
            case YT.PlayerState.BUFFERING:
                break;
            case YT.PlayerState.CUED:
                break;
        }

    }

}