
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import WebRTCService from "../../Base/Common/WebRTCService";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import YouTubeUtil, { YouTubeOption } from "../../Base/Util/YouTubeUtil";
import GadgetVisitorController from "./GadgetVisitorController";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import { CastSettingSender } from "../CastInstance/CastInstanceContainer";
import { Icon } from "../../Base/IndexedDB/Personal";
import { DialogMode } from "../../Base/Common/AbstractDialogController";
import { CursorController } from "../CastVisitor/Cursor/CurosrController";
import { GadgetCastSettingSender } from "../GadgetInstance/GadgetInstanceContainer";


/**
 * 
 */
export class GadgetVisitorView extends AbstractServiceView<GadgetVisitorController> {

    public Cursor: CursorController;
    private YouTubeID: string;


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


    /**
     * 
     * @param opt 
     */
    public SetYouTubePlayer(opt: YouTubeOption) {

        if (this.YouTubeID !== opt.id) {

            YouTubeUtil.GetPlayer(opt, false, (player) => {

                YouTubeUtil.SetStartEndTime(opt);
                player.playVideo();

                this.YouTubeID = opt.id;
            });

        }
        
    }

}