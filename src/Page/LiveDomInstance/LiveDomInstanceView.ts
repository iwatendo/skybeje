
import * as Home from "../../Contents/IndexedDB/Home";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LogUtil from "../../Base/Util/LogUtil";

import LiveDomInstanceController from "./LiveDomInstanceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";

export default class LiveDomInstanceView extends AbstractServiceView<LiveDomInstanceController> {

    public Cursor: CastPropController;

    /**
     * 初期化処理
     */
    public Initialize() {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();

        let startButton = document.getElementById('sbj-livedom-instance-start');
        let stopButton = document.getElementById('sbj-livedom-instance-stop');

        //  ストリーミング開始ボタン
        startButton.onclick = (e) => {
            this.ChangeDisplayMode(true);
            this.StartLiveDom();
        }

        //  ストリーミング停止ボタン
        stopButton.onclick = (e) => {
            this.Controller.ServerSend(false, false);
            location.href = "";
        };

        let cursorDispElement = document.getElementById('sbj-check-cursor-disp') as HTMLInputElement;
        cursorDispElement.onchange = (e) => { this.SendOption(); }


        this.InitializeCursor();
    }


    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-livedom-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoom(room: Home.Room) {
        let message = "「" + room.name + "」に配信中";
        document.getElementById("sbj-livedom-room-name").innerText = message;
    }


    /**
     * フレームを閉じる
     */
    public Close() {
        //  ストリーミング中の場合は表示を切替える
        this.Controller.CastStatus.isHide = this.Controller.CastStatus.isCasting;
        //  ストリーミングしていない場合、フレームを閉じる
        this.Controller.CastStatus.isClose = !this.Controller.CastStatus.isCasting;
        this.Controller.SendCastInfo();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {
        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-livedom-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-livedom-cursor-port') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, video, itemport, curport);
        this.Cursor.DisplayAll();
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


    public SendOption() {
        this.Controller.CastSetting.isSFU = false;
        this.Controller.CastSetting.useCastProp = (document.getElementById('sbj-check-cursor-disp') as HTMLInputElement).checked;
        this.Controller.SendCastInfo();
    }


    /**
     * 
     * @param isLive 
     */
    public ChangeDisplayMode(isLive: boolean) {
        let startButton = document.getElementById('sbj-livedom-instance-start');
        let stopButton = document.getElementById('sbj-livedom-instance-stop');
        let roomName = document.getElementById('sbj-livedom-room-name');
        let linkElement = document.getElementById('sbj-client-link');

        startButton.hidden = isLive;
        stopButton.hidden = !isLive;

        roomName.hidden = !isLive;
        linkElement.hidden = !isLive;
    }


    /** 
     * 
     */
    public StartLiveDom() {
        let linkurl = LinkUtil.CreateLink("../LiveDomVisitor", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, clipcopybtn, clientopenbtn, qrcode);

        this.Controller.ServerSend(true, false);
    }

}
