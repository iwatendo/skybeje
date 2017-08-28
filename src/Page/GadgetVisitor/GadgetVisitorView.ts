
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

        this.SetYouTubePlayer(JSON.parse(sender.guide.embedstatus) as YouTubeOption);
    }


    private _isLoaded: boolean = false;
    private _callback = null;

    /**
     * 
     * @param opt 
     */
    public SetYouTubePlayer(opt: YouTubeOption) {

        if (this.YouTubeOption === null || this.YouTubeOption.id !== opt.id) {

            this.YouTubeOption = opt;

            YouTubeUtil.GetPlayer(opt, true, (player) => {

                this.SetYouTubeListener(player);
                this._isLoaded = true;

                if (this._callback != null) {
                    this._callback();
                }
                else {
                    WebRTCService.SendToOwner(new GetYouTubeStatusSender());
                }

            });

        }
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
     * YouTubeの再生状況の変更を
     * オーナーに通知する
     */
    private SendYouTubeStatus(state: YT.PlayerState, pbr: number, curtime: number) {

        switch (state) {
            case YT.PlayerState.PLAYING: break;
            case YT.PlayerState.ENDED: break;
            case YT.PlayerState.PAUSED: break;
            case YT.PlayerState.CUED: break;
            default: return;
        }

        //  通知情報の生成
        let sender = new YouTubeStatusSender();
        sender.pid = this.Controller.PeerId;
        sender.state = state;
        sender.playbackRate = pbr;
        sender.current = curtime;

        //  オーナーに通知する
        WebRTCService.SendToOwner(sender);
    }


    private _preStatus: YouTubeStatusSender = null;


    /**
     * オーナーからのYouTube再生通知
     * @param sender 
     */
    public SetYouTubeStatus(sender: YouTubeStatusSender) {

        this._preStatus = sender;

        if (sender.pid === this.Controller.PeerId) {
            return;
        }

        let pl = YouTubeUtil.Player;

        let func = () => {

            this.YouTubeOption.start = sender.current;

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
                    YouTubeUtil.CueVideo(this.YouTubeOption);
                    break;
            }
        };

        if (this._isLoaded) {
            func();
        }
        else {
            this._callback = func;
        }

    }


}