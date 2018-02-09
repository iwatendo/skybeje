
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import YouTubeUtil, { YouTubeOption, OnCreateYouTubePlayer } from "../../Contents/Util/YouTubeUtil";
import GadgetVisitorController from "./GadgetVisitorController";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import { CastSettingSender } from "../CastInstance/CastInstanceContainer";
import { Icon } from "../../Contents/IndexedDB/Personal";
import { DialogMode } from "../../Base/AbstractDialogController";
import { CursorController } from "../CastVisitor/Cursor/CurosrController";
import { GadgetCastSettingSender, GetYouTubeStatusSender, YouTubeStatusSender } from "../GadgetInstance/GadgetInstanceContainer";


/**
 * 
 */
export class GadgetVisitorView extends AbstractServiceView<GadgetVisitorController> {

    public Cursor: CursorController;


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
        option.start = sender.status.current;

        YouTubeUtil.GetPlayer(option, false, (player) => {
            //  クライアント側は音がなる状態で起動
            player.unMute();

            this.SetYouTubeListener(player);
            YouTubeUtil.CueVideo(option);
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
                case YT.PlayerState.PLAYING: this._cancelExec(); break;
                case YT.PlayerState.ENDED:
                    break;
                case YT.PlayerState.PAUSED: this._cancelExec(); break;
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
        sender.state = state;
        sender.playbackRate = pbr;
        sender.current = curtime;

        //  オーナーに通知する
        this.Controller.SwPeer.SendToOwner(sender);
    }


    /**
     * クライアント側での
     * 停止/再生処理をキャンセルさせる為の処理
     */
    public _cancelExec = () => { YouTubeUtil.Player.playVideo(); };


    /**
     * オーナーからのYouTube再生通知
     * @param sender 
     */
    public SetYouTubeStatus(sender: YouTubeStatusSender) {

        if (!YouTubeUtil.IsCreatePlayer)
            return;

        let pl = YouTubeUtil.Player;

        if (pl.getPlaybackRate() !== sender.playbackRate) {
            pl.setPlaybackRate(sender.playbackRate);
        }

        switch (sender.state) {
            case YT.PlayerState.PLAYING:
                pl.playVideo();
                this._cancelExec = () => { pl.playVideo(); }
                break;
            case YT.PlayerState.ENDED:
                break;
            case YT.PlayerState.PAUSED:
                pl.pauseVideo();
                pl.seekTo(sender.current, true);
                this._cancelExec = () => { pl.pauseVideo(); }
                break;
            case YT.PlayerState.BUFFERING:
                break;
            case YT.PlayerState.CUED:
                break;
        }

    }

}