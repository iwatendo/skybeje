
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import LogUtil from "../../Base/Util/LogUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import CastVisitorController from "./CastVisitorController";
import IconCursorSender from "../../Base/Container/IconCursorSender";
import { CastSettingSender } from "../CastInstance/CastInstanceContainer";
import { CastCursor, CursorController } from "./Cursor/CurosrController";
import { Icon } from "../../Base/IndexedDB/Personal";
import { SubTitlesController } from "./SubTitles/SubTitlesController";
import MobileDialog from "./Mobile/MobileDialog";
import { DialogMode } from "../../Base/Common/AbstractDialogController";


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


        //  別タブで開かれたステージはサブメニューは表示しない
        if (LinkUtil.GetArgs("allout")) {
            document.getElementById('sbj-cast-visitor-allout').hidden = true;
            document.getElementById('sbj-cast-visitor-mobile-view').hidden = true;
        }


        //  mobileViewボタン
        document.getElementById('sbj-cast-visitor-mobile-view').onclick = (e) => {
            this.DoShowQrCodeDialog();
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

        //  クライアント側の発言アイコン通知
        let lastChatAidElement = document.getElementById('lastChatAid') as HTMLInputElement;
        let lastChatIidElement = document.getElementById('lastChatIid') as HTMLInputElement;

        let chnageLastChatActor = (e) => {
            let aid = lastChatAidElement.textContent;
            let iid = lastChatIidElement.textContent;

            this.Cursor.SetLastChatActor(aid, iid);
        }

        lastChatAidElement.onclick = chnageLastChatActor;
        lastChatIidElement.onclick = chnageLastChatActor;
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

        if (!sender.dispSubtitles) {
            this.SubTitles.Clear();
        }
    }


    /**
     * 
     */
    public DoShowQrCodeDialog() {

        let catUrl = window.location.href;

        if (!catUrl.indexOf("mute")) { catUrl += "&mute=1"; }
        catUrl += "&allout=1";

        let dialog = new MobileDialog(this.Controller);
        dialog.Show(DialogMode.View, catUrl, () => { });

    }

}