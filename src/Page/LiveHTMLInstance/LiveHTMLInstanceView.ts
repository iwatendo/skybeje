
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LogUtil from "../../Base/Util/LogUtil";

import LiveHTMLInstanceController from "./LiveHTMLInstanceController";
import LinkUtil from "../../Base/Util/LinkUtil";
import CastPropController from "../CastProp/CastPropController";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import { Room } from "../../Contents/IndexedDB/Home";
import LiveHTMLSender from "../../Contents/Sender/LiveHTMLSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import LocalCache from "../../Contents/Cache/LocalCache";
import MdlUtil from "../../Contents/Util/MdlUtil";
import PageSettingsController from "./PageSettings/PageSettingsController";
import { PageSettings } from "../../Contents/IndexedDB/LiveHTML";

export default class LiveHTMLInstanceView extends AbstractServiceView<LiveHTMLInstanceController> {

    public Cursor: CastPropController;
    public LiveHTML: LiveHTMLSender;
    public PageSettings: PageSettingsController;

    private _hasOwner: boolean = false;

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();

        //  ストリーミング開始ボタン
        document.getElementById('sbj-livehtml-instance-start').onclick = (e) => {
            this.ChangeDisplayMode(true);
            this.StartLiveHTML();
        }

        //  ストリーミング停止ボタン
        document.getElementById('sbj-livehtml-instance-stop').onclick = (e) => {
            this.Controller.ServerSend(false, false);
            location.href = "";
        };

        //  ユーザーのカーソル表示可否の変更
        document.getElementById('sbj-check-cursor-disp').onchange = (e) => {
            this.SendOption();
        }

        this.PageSettings = new PageSettingsController(this.Controller, document.getElementById('sbj-livehtml-pageitems'));

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
        document.getElementById("sbj-livehtml-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * 配信ルーム名の表示
     * @param room 
     */
    public SetRoom(room: Room) {
        let message = "「" + room.name + "」に配信中";
        document.getElementById("sbj-livehtml-room-name").innerText = message;
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
        let content = document.getElementById('sbj-livehtml-content') as HTMLVideoElement;
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
        let startButton = document.getElementById('sbj-livehtml-instance-start');
        let stopButton = document.getElementById('sbj-livehtml-instance-stop');
        let roomName = document.getElementById('sbj-livehtml-room-name');
        let linkElement = document.getElementById('sbj-client-link');
        let castTitle = document.getElementById('sbj-livehtml-cast-title');

        startButton.hidden = isLive;
        stopButton.hidden = !isLive;

        roomName.hidden = !isLive;
        linkElement.hidden = !isLive;
        castTitle.hidden = !isLive;
    }

    /***
     * 表示切替
     */
    public ChangeDisplayEditMode(isPageSetting: boolean) {
        document.getElementById('sbj-livehtml-main-content').hidden = isPageSetting;
        document.getElementById('sbj-livehtml-edit-content').hidden = !isPageSetting;
        document.getElementById('sbj-livehtml-page-edit-close').hidden = !isPageSetting;

        if (!isPageSetting) {
            this.PageSettings.Display();

            let ps = this.PageSettings.GetSelect();

            //  選択行かつ表示中の行の場合は更新内容をSendする
            if (ps) {
                let liveId = (this.LiveHTML ? this.LiveHTML.pageId : "");
                if (ps.pageId === liveId) {
                    this.SendLiveHTML(ps);
                }
            }
        }
    }


    /** 
     * 
     */
    public StartLiveHTML() {

        let linkurl = LinkUtil.CreateLink("../LiveHTMLVisitor/", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

        this.Controller.ServerSend(true, false);
    }


    /**
     * 
     */
    public SendLiveHTML(ps: PageSettings) {
        this.LiveHTML = new LiveHTMLSender(ps);
        this.Controller.SwPeer.SendAll(this.LiveHTML);

        let castTitle: string = "";

        if (ps.pageName.length > 0) {
            castTitle = ps.pageName;
            if (ps.pageTag.length > 0) {
                castTitle += "（" + ps.pageTag + "）";
            }
            castTitle = "「" + castTitle + "」を表示中";
        }
        else {
            castTitle = "ページ未表示";
        }

        document.getElementById('sbj-livehtml-cast-title').textContent = castTitle;
    }

}
