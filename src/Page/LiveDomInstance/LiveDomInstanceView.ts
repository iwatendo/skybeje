
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LogUtil from "../../Base/Util/LogUtil";

import LiveDomInstanceController from "./LiveDomInstanceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import { Room } from "../../Contents/IndexedDB/Home";
import LiveDomSender from "../../Contents/Sender/LiveDomSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import LocalCache from "../../Contents/Cache/LocalCache";
import MdlUtil from "../../Contents/Util/MdlUtil";
import PageSettingsController from "./PageSettings/PageSettingsController";
import { PageSettings } from "../../Contents/IndexedDB/LiveHTML";

export default class LiveDomInstanceView extends AbstractServiceView<LiveDomInstanceController> {

    public Cursor: CastPropController;
    public LiveDom: LiveDomSender;
    public PageSettings: PageSettingsController;

    private _hasOwner: boolean = false;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();

        //  ストリーミング開始ボタン
        document.getElementById('sbj-livedom-instance-start').onclick = (e) => {
            this.ChangeDisplayMode(true);
            this.StartLiveDom();
        }

        //  ストリーミング停止ボタン
        document.getElementById('sbj-livedom-instance-stop').onclick = (e) => {
            this.Controller.ServerSend(false, false);
            location.href = "";
        };

        //  ユーザーのカーソル表示可否の変更
        document.getElementById('sbj-check-cursor-disp').onchange = (e) => {
            this.SendOption();
        }

        this.PageSettings = new PageSettingsController(this.Controller, document.getElementById('sbj-livedom-pageitems'));

        this.InitializeCursor();
        callback();
    }


    /**
     * 
     */
    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
        this._hasOwner = true;
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
    public SetRoom(room: Room) {
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
        let content = document.getElementById('sbj-livedom-content') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-cast-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-cast-cursor-port') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => {
            let offset = new CursorDispOffset();
            offset.clientWidth = content.clientWidth;
            offset.clientHeight = content.clientHeight;
            offset.dispWidth = content.clientWidth;
            offset.dispHeight = content.clientHeight;
            return offset;
        });
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

    /***
     * 表示切替
     */
    public ChangeDisplayEditMode(isPageSetting: boolean) {
        document.getElementById('sbj-livedom-main-content').hidden = isPageSetting;
        document.getElementById('sbj-livedom-edit-content').hidden = !isPageSetting;

        if (!isPageSetting) {
            this.PageSettings.Display();
        }

    }



    /** 
     * 
     */
    public StartLiveDom() {

        let linkurl = LinkUtil.CreateLink("../LiveDomVisitor/", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

        this.Controller.ServerSend(true, false);
    }


    /**
     * 
     */
    public SendLiveDom(ps: PageSettings) {
        this.LiveDom = new LiveDomSender(ps);
        this.Controller.SwPeer.SendAll(this.LiveDom);
    }

}
