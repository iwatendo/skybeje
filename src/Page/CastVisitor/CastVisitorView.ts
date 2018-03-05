
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import CastVisitorController from "./CastVisitorController";
import { CastCursor, CursorController } from "./Cursor/CurosrController";
import { Icon } from "../../Contents/IndexedDB/Personal";
import { SubTitlesController } from "./SubTitles/SubTitlesController";
import { DialogMode } from "../../Contents/AbstractDialogController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import CursorInfoSender from "../../Contents/Sender/CursorInfoSender";


/**
 * 
 */
export class CastVisitorView extends AbstractServiceView<CastVisitorController> {

    public Cursor: CursorController;
    public SubTitles: SubTitlesController;


    //
    public Initialize(callback: OnViewLoad) {

        this.SubTitles = new SubTitlesController();

        StdUtil.StopPropagation();

        let submenuMain = document.getElementById('sbj-cast-visitor-submenu');
        submenuMain.onmouseover = (e) => {
            submenuMain.style.opacity = "1.0";
        }

        submenuMain.onmouseout = (e) => {
            submenuMain.style.opacity = "0.0";
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
        document.getElementById('sbj-cact-visitor-volume').onclick = (e) => {
            video.muted = !video.muted;
            this.ChangeDispMuteButton(video.muted);
        };

        //  ボリューム設定処理
        let valumeRange = document.getElementById('sbj-cast-visitor-volume-value') as HTMLInputElement;
        valumeRange.onchange = (e) => {
            let value = Number.parseInt(valumeRange.value);
            video.volume = (value / 100);
        };

        video.oncanplay = (ev) => {
            let voiceOnly = (video.videoHeight === 0 || video.videoWidth === 0);
            let element = document.getElementById('sbj-cact-visitor-voice-only');
            if (element) {
                element.hidden = !voiceOnly;
            }
            this.Cursor.DisplayAll();
        };

        callback();
    }


    /**
     * ミュートボタンの設定
     * @param isMute 
     */
    public ChangeDispMuteButton(isMute: boolean) {
        document.getElementById('sbj-cact-visitor-volume-on').hidden = isMute;
        document.getElementById('sbj-cact-visitor-volume-off').hidden = !isMute;
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {

        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-cact-visitor-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-cact-visitor-cursor-port') as HTMLElement;
        this.Cursor = new CursorController(this.Controller, video, itemport, curport);
        this.Cursor.DisplayAll();


        MessageChannelUtil.SetChild(this.Controller, (sender) => {

            let curInfo = sender as CursorInfoSender;
            if (sender) {
                this.Cursor.CursorInfo = curInfo;
                if (curInfo.isDispChange) {
                    this.Cursor.SetLastChatActor(curInfo.aid, curInfo.iid);
                }
            }

        });
    }


    /**
     * ライブキャストの設定変更
     * @param sender
     */
    public SetCastSetting(sender: CastSettingSender) {

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