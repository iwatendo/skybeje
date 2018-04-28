import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";
import CastPropController from "../CastProp/CastPropController";
import CastVisitorController from "./CastVisitorController";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";

/**
 * 
 */
export class CastVisitorView extends AbstractServiceView<CastVisitorController> {

    public Cursor: CastPropController;


    public IsMobile: boolean;


    //
    public Initialize(callback: OnViewLoad) {

        this.IsMobile = StdUtil.IsMobile();
        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        StdUtil.StopTouchZoom();

        //  Video
        let video = document.getElementById('sbj-video') as HTMLVideoElement;

        if (this.IsMobile) {

            //  モバイル端末の場合
            document.getElementById('sbj-cast-visitor-submenu-mobile').hidden = false;
            document.getElementById('sbj-cast-visitor-volume-mobile').onclick = (e) => { this.SetMute(!video.muted); };
            this.SetMute(true);

        }
        else {

            //  ＰＣの場合
            let submenu = document.getElementById('sbj-cast-visitor-submenu') as HTMLElement;
            let panel = document.getElementById('sbj-cursor-layer') as HTMLElement;
            panel.onmouseenter = (e) => { submenu.style.opacity = "1.0"; }
            panel.onmouseover = (e) => { submenu.style.opacity = "1.0"; }
            panel.onmouseout = (e) => { submenu.style.opacity = "0.0"; }
            submenu.onmouseover = (e) => { submenu.style.opacity = "1.0"; }
            submenu.onmouseout = (e) => { submenu.style.opacity = "0.0"; }
            submenu.hidden = false;
            submenu.style.opacity = "0.0";

            document.getElementById('sbj-cast-visitor-volume').onclick = (e) => { this.SetMute(!video.muted); };

            //  ミュート初期設定
            let muteArg = LinkUtil.GetArgs("mute");
            this.SetMute(muteArg && muteArg.length > 0);

            //  ボリューム設定
            let valumeRange = document.getElementById('sbj-cast-visitor-volume-value') as HTMLInputElement;
            valumeRange.onchange = (e) => {
                let value = Number.parseInt(valumeRange.value);
                video.volume = (value / 100);
            };

            //  リロード処理
            document.getElementById('sbj-cast-visitor-reload').onclick = (e) => {
                location.reload();
            }

        }

        video.oncanplay = (ev) => {
            let voiceOnly = (video.videoHeight === 0 || video.videoWidth === 0);
            let element = document.getElementById('sbj-cast-visitor-voice-only');
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
    public SetMute(isMute: boolean) {

        (document.getElementById('sbj-video') as HTMLVideoElement).muted = isMute;

        if (this.IsMobile) {
            document.getElementById('sbj-cast-visitor-volume-mobile-on').hidden = isMute;
            document.getElementById('sbj-cast-visitor-volume-mobile-off').hidden = !isMute;
        }
        else {
            document.getElementById('sbj-cast-visitor-volume-on').hidden = isMute;
            document.getElementById('sbj-cast-visitor-volume-off').hidden = !isMute;
        }
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {

        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return CursorDispOffset.GetVideoDispOffset(video); });
        this.Cursor.DisplayAll();

        MessageChannelUtil.SetChild(this.Controller, (sender) => {
            let cst = sender as ChatStatusSender;
            this.Cursor.SetChatStatus(cst);
        });
    }


    /**
     * ライブキャストの設定変更
     * @param sender
     */
    public SetCastSetting(sender: CastSettingSender) {

        if (this.Cursor) {
            if (!sender.useCastProp) {
                this.Cursor.Clear();
            }
        }
    }

}