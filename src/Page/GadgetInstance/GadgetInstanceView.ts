
import * as Home from "../../Contents/IndexedDB/Home";
import * as Personal from "../../Contents/IndexedDB/Personal";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import DeviceUtil from "../../Base/Util/DeviceUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import GadgetInstanceController from "./GadgetInstanceController";
import YouTubeUtil, { YouTubeOption } from "../../Contents/Util/YouTubeUtil";
import LogUtil from "../../Base/Util/LogUtil";
import GuideUtil from "../../Contents/Util/GuideUtil";
import LocalCache from "../../Contents/Cache/LocalCache";
import YouTubeStatusSender from "../../Contents/Sender/YouTubeStatusSender";
import LinkUtil from "../../Base/Util/LinkUtil";

export default class GadgetInstanceView extends AbstractServiceView<GadgetInstanceController> {

    private _mainElement = document.getElementById("sbj-gadget-instance-main");
    private _startFunc: any;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        let backpanel = document.getElementById('sbj-gadget-instance');
        let mainpanel = document.getElementById('sbj-gadget-instance-layout');
        let startButton = document.getElementById('sbj-gadget-instance-start') as HTMLInputElement;
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

        //  開始ボタン
        startButton.onclick = (e) => {
            this.Start();
        }

        //  停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.SendToOwner_Close();
            location.href = "";
        };

        let options = LocalCache.GadgetCastOptions;

        //  カーソル表示有無
        let cursorDispElement = document.getElementById('sbj-check-cursor-disp') as HTMLInputElement;
        cursorDispElement.onchange = (e) => {

            let isCheced = cursorDispElement.checked;

            this.Controller.CastSetting.dispUserCursor = isCheced;
            this.Controller.SwPeer.SendAll(this.Controller.CastSetting);
        };

        let controller = this.Controller;

        GuideUtil.SetEvent(mainpanel, (url, embedstatus) => {
            let guide = new Personal.Guide();
            guide.url = url;
            guide.embedstatus = embedstatus;
            this.SetGuide(guide, true);
        });
        YouTubeUtil.Initialize("sbj-youtube-api-ready", "sbj-guide-youtube-player");
        callback();
    }


    public SetLinkUrlEvent() {
        //  接続URLのコピー
        let linkurl = LinkUtil.CreateLink("../GadgetVisitor", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLInputElement;
        LinkUtil.SetCopyLinkButton(linkurl, clipcopybtn);
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
        let message = "「" + room.name + "」に配信中";
        document.getElementById("sbj-livecast-room-name").innerText = message;
    }


    /**
     * 
     * @param guide 
     * @param isStart 
     */
    public SetGuide(guide: Personal.Guide, isStart: boolean) {

        if (!guide)
            return;

        let option = JSON.parse(guide.embedstatus) as YouTubeOption;

        YouTubeUtil.GetPlayer(option, true, (player) => {

            //  インスタンス側はミュート状態で起動
            player.mute();

            //  動画の再生時間情報がセットされていない場合は設定する
            option.last = player.getDuration();
            if (option.start <= 0) option.start = 0;
            if (option.end <= 0) option.end = option.last;

            this.Controller.CastSetting.guide = guide;
            let status = new YouTubeStatusSender();
            status.state = YT.PlayerState.CUED;
            status.playbackRate = 1;
            status.current = option.start;
            this.Controller.CastSetting.status = status;

            (document.getElementById('sbj-gadget-instance-start') as HTMLInputElement).disabled = false;

            this._startFunc = () => {
                this.Controller.SwPeer.SendAll(this.Controller.CastSetting);
                this.SetYouTubeListener(player);
                YouTubeUtil.CueVideo(option);
                this.Controller.SendToOwner_CastStart();
            }

            if (isStart) { this.Start(); }
        });
    }


    /**
     * 配信開始
     */
    public Start() {
        if (this._startFunc) {
            this._startFunc();
            document.getElementById('sbj-gadget-instance-start').hidden = true;
            document.getElementById('sbj-gadget-instance-stop').hidden = false;
            document.getElementById('sbj-livecast-room-name').hidden = false;
            document.getElementById('sbj-gadget-instance-account-count').hidden = false;
            document.getElementById('sbj-linkcopy').hidden = false;
        }
    }


    /**
     * 
     */
    private _cueMap: Map<string, string>;


    /**
     * 
     * @param peerid 
     */
    public SetCueMap(peerid: string) {
        this._cueMap.set(peerid, peerid);
    }


    /**
     * 
     * @param polingTime 
     */
    public CueSyncPolling(polingTime: number) {

        let interval = 200;
        let timeout = 5000;

        let clcount = this.Controller.SwPeer.GetAliveConnectionCount();

        if ((clcount > 0 && clcount <= this._cueMap.size) || polingTime > timeout) {
            YouTubeUtil.Player.playVideo();
        }
        else {
            setTimeout(() => { this.CueSyncPolling(polingTime + interval) }, interval);
        }
    }


    /**
     * 
     */
    public SyncWait() {
        this._cueMap = new Map<string, string>();
        this.CueSyncPolling(0);
    }


    /**
     * フレームを閉じる
     */
    public Close() {
        if (this.Controller.CastInstance.isCasting) {
            this.Controller.SendToOwner_Hide();
        }
        else {
            this.Controller.SendToOwner_Close();
        }
    }


    /**
     * YouTubePlayerの再生ステータスの変更検知リスナーの登録
     * @param player 
     */
    private SetYouTubeListener(player: YT.Player) {

        let isEnd = false;

        player.addEventListener('onStateChange', (event) => {
            let state = ((event as any).data) as YT.PlayerState;

            switch (state) {
                case YT.PlayerState.PLAYING:
                    break;
                case YT.PlayerState.ENDED:
                    isEnd = true;
                    break;
                case YT.PlayerState.PAUSED:
                    //  自働
                    if (YouTubeUtil.Option.end <= YouTubeUtil.Player.getCurrentTime()) {
                        return;
                    }
                    break;
                case YT.PlayerState.BUFFERING:
                    break;
                case YT.PlayerState.CUED:
                    if (!isEnd) {
                        this.SyncWait();
                    }
                    break;
                case YT.PlayerState.UNSTARTED: return;
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
     * YouTube動画の再生状況を取得する
     * ※途中接続のVisitorへ再生状況を伝えるための処理
     */
    public CreateYouTubeStatus(): YouTubeStatusSender {
        let pl = YouTubeUtil.Player;
        let sender = new YouTubeStatusSender();
        sender.state = pl.getPlayerState();
        sender.playbackRate = pl.getPlaybackRate();
        sender.current = pl.getCurrentTime();
        return sender;
    }


    /**
     * YouTubeの再生状況の変更を
     * 接続クライアントに通知する
     */
    private SendYouTubeStatus(state: YT.PlayerState, pbr: number, curtime: number) {

        //  通知情報の生成
        let sender = new YouTubeStatusSender();
        sender.state = state;
        sender.playbackRate = pbr;
        sender.current = curtime;

        //  接続クライアントに通知
        this._preSender = sender;
        this.Controller.SwPeer.SendAll(sender);
    }

    private _preSender = null;


    /**
     * 接続クライアントからのステータス通知の取得
     * @param sender 
     */
    public SetYouTubeStatus(conn: PeerJs.DataConnection, sender: YouTubeStatusSender) {

        switch (sender.state) {
            case YT.PlayerState.PLAYING:
                break;
            case YT.PlayerState.ENDED:
                break;
            case YT.PlayerState.PAUSED:
                break;
            case YT.PlayerState.BUFFERING:
                break;
            case YT.PlayerState.CUED:
                if (YouTubeUtil.IsCreatePlayer) {
                    if (YouTubeUtil.Player.getPlayerState() === YT.PlayerState.CUED) {
                        this.SetCueMap(conn.remoteId);
                    }
                    else {
                        this.Controller.SwPeer.SendTo(conn, this.CreateYouTubeStatus());
                    }
                }
                break;
            case YT.PlayerState.UNSTARTED: return;
            default: return;
        }

    }


}
