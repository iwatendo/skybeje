
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

        let option = JSON.parse(guide.embedstatus) as YouTubeOption;
        YouTubeUtil.GetPlayer(option, true, (player) => {
            YouTubeUtil.CueVideo(option);
            this.SetYouTubeListener(option, player);
            this.Controller.YouTubeOption.option = option;
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
     * YouTubeの再生状況の取得
     */
    public GetYouTubeStatus(): YouTubeStatusSender {
        this.Controller.YouTubeOption.state = YouTubeUtil.Player.getPlayerState();
        this.Controller.YouTubeOption.current = YouTubeUtil.Player.getCurrentTime();
        return this.Controller.YouTubeOption;
    }


    /**
     * 
     * @param options 
     * @param player 
     */
    private SetYouTubeListener(option: YouTubeOption, player: YT.Player) {

        player.addEventListener('onStateChange', (event) => {

            let state = ((event as any).data) as YT.PlayerState;

            switch ((event as any).data) {
                case YT.PlayerState.PLAYING:
                    WebRTCService.SendAll(this.GetYouTubeStatus());
                    break;
                case YT.PlayerState.ENDED:
                    WebRTCService.SendAll(this.GetYouTubeStatus());
                    break;
                case YT.PlayerState.PAUSED:
                    WebRTCService.SendAll(this.GetYouTubeStatus());
                    break;
                case YT.PlayerState.CUED:
                    player.playVideo();
                    break;
            }
        });

    }

}
