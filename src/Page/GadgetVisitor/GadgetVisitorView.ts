
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


    private _isLoad: boolean = false;
    private _callback = null;

    /**
     * 
     * @param opt 
     */
    public SetYouTubePlayer(opt: YouTubeOption) {

        if (this.YouTubeOption === null || this.YouTubeOption.id !== opt.id) {
            this.YouTubeOption = opt;
            YouTubeUtil.GetPlayer(opt, false, (player) => {
                this.SetYouTubeListener(player);
                this._isLoad = true;
                if (this._callback != null) {
                    this._callback();
                }
            });
        }
    }


    /**
     * 
     * @param player 
     */
    private SetYouTubeListener(player: YT.Player) {

        player.addEventListener('onStateChange', (event) => {

            let state = ((event as any).data) as YT.PlayerState;

            switch ((event as any).data) {
                case YT.PlayerState.PLAYING:
                    LogUtil.Info(this.Controller, "PLAYING");
                    break;
                case YT.PlayerState.ENDED:
                    LogUtil.Info(this.Controller, "ENDED");
                    break;
                case YT.PlayerState.PAUSED:
                    LogUtil.Info(this.Controller, "PAUSED");
                    break;
                case YT.PlayerState.CUED:
                    LogUtil.Info(this.Controller, "CUED");
                    WebRTCService.SendToOwner(new GetYouTubeStatusSender());
                    break;
            }
        });
    }


    /**
     * 
     * @param sender 
     */
    public SetYouTubeStatus(sender: YouTubeStatusSender) {

        let pl = YouTubeUtil.Player;

        let func = () => {
            this.YouTubeOption.start = sender.current;
            switch (sender.state) {
                case YT.PlayerState.PLAYING:
                    YouTubeUtil.LoadVideo(this.YouTubeOption);
                    pl.playVideo();
                    break;
                case YT.PlayerState.ENDED:
                    break;
                case YT.PlayerState.PAUSED:
                    pl.pauseVideo();
                    pl.seekTo(sender.current, true);
                    break;
                case YT.PlayerState.CUED:
                    break;
            }
        };

        if (this._isLoad) {
            func();
        }
        else {
            this._callback = func;
        }

    }


}