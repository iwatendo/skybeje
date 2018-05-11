
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
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";

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

        //  単体配信の場合
        if (!LinkUtil.GetPeerID()) {
            this.SetRoomName(null);
        }

        this.PageSettings = new PageSettingsController(this.Controller, document.getElementById('sbj-livehtml-pageitems'));

        //  LiveHTMLのプレビューにはカーソル表示しない
        //  this.InitializeCursor();

        window.onresize = (e) => { this.Resize(); };
        this.Resize();
        callback();
    }


    /**
     * リサイズ時処理
     */
    public Resize() {

        let clientWidth = window.document.documentElement.clientWidth;
        let leftpos = 572;
        if (clientWidth > 1632) {
            leftpos += (clientWidth - 1632) / 2;
        }

        let submenu = document.getElementById('sbj-livehtml-page-edit-menu');
        submenu.style.left = leftpos + "px";
    }

    /**
     * 配信中ページID
     */
    public get LivePageId(): string {
        if (this.LiveHTML) {
            return this.LiveHTML.pageId;
        }
        else {
            return "";
        }
    }


    /**
     * 
     */
    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
        (document.getElementById('sbj-check-chatlinkage-label') as HTMLInputElement).hidden = false;
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
    public SetRoomName(room: Room) {
        let title = (room ? room.name + "に配信" : "単体で配信");
        document.getElementById("sbj-livehtml-room-name").innerText = title;
        this.ReadyCheck();
    }


    /**
     * 配信開始可能か確認
     */
    public ReadyCheck() {

        let disabled = true;

        //  配信先のチャットルームが確定かつ、カメラまたはマイクデバイスが選択されている場合
        //  配信開始ボタン押下を許可
        if (this.Controller.IsReady()) {
            disabled = !(this.LiveHTML && this.LiveHTML.pageId);
        }

        let startButton = document.getElementById('sbj-livehtml-instance-start') as HTMLButtonElement;
        startButton.disabled = disabled;
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
        let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;

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
        let linkElement = document.getElementById('sbj-client-link');
        let noteElement = document.getElementById('sbj-livehtml-note');

        startButton.hidden = isLive;
        stopButton.hidden = !isLive;

        linkElement.hidden = !isLive;
        noteElement.hidden = isLive;
    }


    /***
     * 表示切替
     */
    public ChangeDisplayEditMode(isPageSetting: boolean) {
        document.getElementById('sbj-livehtml-edit-content').hidden = !isPageSetting;
        document.getElementById('sbj-livehtml-page-edit-close').hidden = !isPageSetting;

        if (isPageSetting) {
            if (this.Cursor) {
                this.Cursor.DisplayAll();
            }
        }
        else {
            this.PageSettings.Display();
        }
    }


    /**
     * 配信中のページが更新された場合に、視聴側に反映
     */
    public UpdateLive() {

        let ps = this.PageSettings.GetSelect();
        //  選択行かつ表示中の行の場合は更新内容をSendする
        if (ps) {
            let liveId = (this.LiveHTML ? this.LiveHTML.pageId : "");
            if (ps.pageId === liveId) {
                this.SendLiveHTML(ps);
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
        MdlUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

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
            castTitle = "表示ページ：" + castTitle;
        }
        else {
            castTitle = "表示するHTMLページを選択してください";
        }

        document.getElementById('sbj-livehtml-cast-title').textContent = castTitle;
        this.ReadyCheck();
    }


    /**
     * 
     * @param chat 
     */
    public SetMessage(chat: ChatStatusSender) {

        if (!chat) {
            return;
        }

        if (this.Cursor) {
            this.Cursor.SetMessage(chat);
        }

        if (this.PageSettings) {
            if ((document.getElementById('sbj-check-chatlinkage') as HTMLInputElement).checked) {
                this.PageSettings.ChceckChatLinkage(chat);
            }
        }
    }

}
