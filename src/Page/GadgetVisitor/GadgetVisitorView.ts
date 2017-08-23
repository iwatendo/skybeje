
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import WebRTCService from "../../Base/Common/WebRTCService";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
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


        //  別タブで開かれたステージはサブメニューは表示しない
        if (LinkUtil.GetArgs("allout")) {
            document.getElementById('sbj-cast-visitor-allout').hidden = true;
            document.getElementById('sbj-cast-visitor-mobile-view').hidden = true;
        }

        //  alloutボタン押下時の場合は別タブで開く
        document.getElementById('sbj-cast-visitor-allout').onclick = (e) => {
            let url = window.location.href;

            if (!url.indexOf("mute")) { url += "&mute=1"; }
            url += "&allout=1";

            window.open(url);
        }

        //  Video
        let video = document.getElementById('sbj-video') as HTMLVideoElement;

        //  ミュート設定
        let mute = LinkUtil.GetArgs("mute");
        if (mute != null && mute.length > 0) {
            video.muted = true;
            this.ChangeDispMuteButton(true);
        }

        //  ミュートボタン押下時処理
        document.getElementById('sbj-gadget-visitor-volume').onclick = (e) => {
            video.muted = !video.muted;
            this.ChangeDispMuteButton(video.muted);
        };

        //  ボリューム設定処理
        let valumeRange = document.getElementById('sbj-cast-visitor-volume-value') as HTMLInputElement;
        valumeRange.onchange = (e) => {
            let value = Number.parseInt(valumeRange.value);
            video.volume = (value / 100);
        };

        video.onplay = (ev) => {
            let voiceOnly = (video.videoHeight === 0 || video.videoWidth === 0);
            document.getElementById('sbj-gadget-visitor-voice-only').hidden = !voiceOnly;
            video.volume;
        };

        callback();
    }


    /**
     * ミュートボタンの設定
     * @param isMute 
     */
    public ChangeDispMuteButton(isMute: boolean) {
        document.getElementById('sbj-gadget-visitor-volume-on').hidden = isMute;
        document.getElementById('sbj-gadget-visitor-volume-off').hidden = !isMute;
    }


    /**
     * ビデオ表示設定
     */
    public initializeCursor() {

        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-gadget-visitor-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-gadget-visitor-cursor-port') as HTMLElement;
        this.Cursor = new CursorController(this.Controller.ConnCache, video, itemport, curport);
        this.Cursor.DisplayAll();
    }


    /**
     * ライブキャストの設定変更
     * @param sender
     */
    public SetGadgetSetting(sender: GadgetCastSettingSender) {

        let video = document.getElementById('sbj-video') as HTMLVideoElement;

        if (this.Cursor) {
            if (sender.dispUserCursor) {
                this.Cursor.ClearQueue();
            }
            else {
                this.Cursor.Clear();
            }
        }
    }

}