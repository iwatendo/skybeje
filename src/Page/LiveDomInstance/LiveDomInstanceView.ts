
import * as JQuery from "jquery";
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

export default class LiveDomInstanceView extends AbstractServiceView<LiveDomInstanceController> {

    public Cursor: CastPropController;
    public LiveDom: LiveDomSender;
    public PreViewLiveDom: LiveDomSender;

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

        //  ページ更新
        let pagepushElement = document.getElementById('sbj-livedom-pushpage');
        pagepushElement.onclick = (e) => {
            pagepushElement.hidden = true;
            this.SendLiveDom();
        };

        //  プレビュー
        document.getElementById('sbj-livedom-preview').onclick = (e) => {
            this.ChangePreview(true);
        };

        //  プレビュー停止
        document.getElementById('sbj-livedom-preview-stop').onclick = (e) => {
            this.ChangePreview(false);
        }

        //  アスペクト比変更
        document.getElementById('sbj-aspect-width').oninput = (e) => {
            if (this.IsChangeLiveDomSettings()) this.ChangeAspect(this.LiveDom);
        }
        document.getElementById('sbj-aspect-height').oninput = (e) => {
            if (this.IsChangeLiveDomSettings()) this.ChangeAspect(this.LiveDom);
        }

        //  ユーザーのカーソル表示可否の変更
        document.getElementById('sbj-check-cursor-disp').onchange = (e) => {
            this.SendOption();
        }

        //  コントロールレイヤーの表示有無
        document.getElementById('sbj-check-control-disp').onchange = (e) => {
            if (this.IsChangeLiveDomSettings()) {

            }
        }

        //  アスペクト比率の指定有無
        document.getElementById('sbj-check-aspect-disp').onchange = (e) => {
            if (this.IsChangeLiveDomSettings()) this.ChangeAspectFixed();
        }

        //  レイヤー設定変更
        for (let i = 1; i <= 4; i++) {
            document.getElementById('sbj-embedded-value-layer' + i.toString()).onchange = (ev) => {
                if (this.IsChangeLiveDomSettings()) this.ChangeLayerDOM(this.LiveDom);
            }
        }

        this.PreViewLiveDom = new LiveDomSender();
        let pre = LocalCache.LiveDomSetting;
        if (pre) {
            //  前回データがある場合は復元
            let setting = JSON.parse(pre) as LiveDomSender;
            this.SetLiveDomSender(setting);
        }
        else {
            //  前回データがない場合は初期値を設定
            let dom = new LiveDomSender();
            dom.aspectW = 4;
            dom.aspectH = 3;
            this.SetLiveDomSender(dom);
        }

        this.InitializeCursor();
        callback();
    }


    /**
     * 
     */
    public InitializeDomSetting() {
        this.ChangeAspect(this.LiveDom);
        this.ChangeLayerDOM(this.LiveDom);
        this.ChangeAspectFixed();
    }


    /**
     * 
     */
    public InitializeChatLink() {
        (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = false;
        this._hasOwner = true;
        this.ChangeAspectFixed();
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
     * 
     */
    public GetLiveDomSender(): LiveDomSender {
        let sender = new LiveDomSender();

        sender.isDispControlLayer = (document.getElementById('sbj-check-control-disp') as HTMLInputElement).checked;
        sender.isAspectFix = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;
        sender.aspectW = Number.parseInt((document.getElementById('sbj-aspect-width') as HTMLInputElement).value);
        sender.aspectH = Number.parseInt((document.getElementById('sbj-aspect-height') as HTMLInputElement).value);
        sender.layerBackgroundB = (document.getElementById('sbj-embedded-value-layer1') as HTMLInputElement).value;
        sender.layerBackgroundF = (document.getElementById('sbj-embedded-value-layer2') as HTMLInputElement).value;
        sender.layerActive = (document.getElementById('sbj-embedded-value-layer3') as HTMLInputElement).value;
        sender.layerControl = (document.getElementById('sbj-embedded-value-layer4') as HTMLInputElement).value;
        return sender;
    }


    /**
     * 
     * @param sender 
     */
    public SetLiveDomSender(sender: LiveDomSender) {
        (document.getElementById('sbj-check-control-disp') as HTMLInputElement).checked = sender.isDispControlLayer;
        (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked = sender.isAspectFix;
        (document.getElementById('sbj-aspect-width') as HTMLInputElement).value = sender.aspectW.toString();
        (document.getElementById('sbj-aspect-height') as HTMLInputElement).value = sender.aspectH.toString();
        (document.getElementById('sbj-embedded-value-layer1') as HTMLInputElement).value = sender.layerBackgroundB;
        (document.getElementById('sbj-embedded-value-layer2') as HTMLInputElement).value = sender.layerBackgroundF;
        (document.getElementById('sbj-embedded-value-layer3') as HTMLInputElement).value = sender.layerActive;
        (document.getElementById('sbj-embedded-value-layer4') as HTMLInputElement).value = sender.layerControl;
        this.LiveDom = sender;
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

        let linkurl = LinkUtil.CreateLink("../LiveDomVisitor/", this.Controller.SwPeer.PeerId);
        let clipcopybtn = document.getElementById('sbj-linkcopy') as HTMLButtonElement;
        let clientopenbtn = document.getElementById('sbj-start-client') as HTMLButtonElement;
        let qrcode = document.getElementById('sbj-link-qrcode') as HTMLFrameElement;
        LinkUtil.SetCopyLinkButton(linkurl, "視聴URL", clipcopybtn, clientopenbtn, qrcode);

        this.Controller.ServerSend(true, false);
        this.SendLiveDom();
    }


    /**
     * 
     */
    public SendLiveDom() {
        this.LiveDom = this.GetLiveDomSender();
        this.Controller.SwPeer.SendAll(this.LiveDom);

        if (!this.LiveDom.isAspectFix) {
            if (this.Controller.CastSetting.useCastProp) {
                this.Controller.CastSetting.useCastProp = false;
                this.Controller.SendCastInfo();
                MdlUtil.SetChecked('sbj-check-cursor-disp', 'sbj-check-cursor-disp-label', false);
            }
        }

    }


    /**
     * 
     */
    public IsChangeLiveDomSettings(): boolean {
        let dom = this.GetLiveDomSender();
        if (!LiveDomSender.Equals(dom, this.LiveDom)) {
            if (this.Controller.CastStatus.isCasting) {
                document.getElementById('sbj-livedom-pushpage').hidden = false;
            }
            LocalCache.LiveDomSetting = JSON.stringify(dom);
            this.LiveDom = dom;
            return true;
        }
        else {
            return false;
        }
    }


    /**
     * レイヤー情報の変更時イベント
     */
    public ChangeLayerDOM(dom: LiveDomSender) {

        if (this.PreViewLiveDom) {
            if (this.PreViewLiveDom.layerBackgroundB !== dom.layerBackgroundB) $("#sbj-livedom-layer1").empty().append(dom.layerBackgroundB);
            if (this.PreViewLiveDom.layerBackgroundF !== dom.layerBackgroundF) $("#sbj-livedom-layer2").empty().append(dom.layerBackgroundF);
            if (this.PreViewLiveDom.layerActive !== dom.layerActive) $("#sbj-livedom-layer3").empty().append(dom.layerActive);
            if (this.PreViewLiveDom.layerControl !== dom.layerControl) $("#sbj-livedom-layer4").empty().append(dom.layerControl);
            this.PreViewLiveDom = dom;
        }
        else {
            $("#sbj-livedom-layer1").empty();
            $("#sbj-livedom-layer2").empty();
            $("#sbj-livedom-layer3").empty();
            $("#sbj-livedom-layer4").empty();
        }
    }


    /**
     * 
     */
    public ChangeAspectFixed() {

        let aspectFixed = (document.getElementById('sbj-check-aspect-disp') as HTMLInputElement).checked;
        document.getElementById('sbj-aspect-setting').hidden = !aspectFixed;

        let dom = this.GetLiveDomSender();

        if (!aspectFixed) {
            dom.aspectW = 4;
            dom.aspectH = 3;
        }

        if (this._hasOwner) {
            (document.getElementById('sbj-check-cursor-disp-label') as HTMLInputElement).hidden = !aspectFixed;
        }

        this.ChangeAspect(dom);
    }


    /**
     * アスペクト比の変更
     */
    public ChangeAspect(dom: LiveDomSender) {
        document.getElementById('sbj-aspect-width-tip').textContent = dom.aspectW.toString();
        document.getElementById('sbj-aspect-height-tip').textContent = dom.aspectH.toString();
        let content = document.getElementById('sbj-livedom-content') as HTMLElement;

        let aspect = dom.aspectW / dom.aspectH;

        if (aspect === 1) {
            content.style.width = "100%";
            content.style.height = "100%";
        }
        else if (aspect < 1) {
            let width = (480 * dom.aspectW / dom.aspectH);
            content.style.width = width.toString(); + "px";
            content.style.height = "100%";
        }
        else {
            let height = (480 * dom.aspectH / dom.aspectW);
            content.style.width = "100%";
            content.style.height = height.toString() + "px";
        }
    }


    /**
     * 埋め込みページの更新
     * @param isPreview 
     */
    public ChangePreview(dispPreview: boolean) {

        document.getElementById('sbj-livedom-preview').hidden = dispPreview;
        document.getElementById('sbj-livedom-preview-stop').hidden = !dispPreview;

        if (dispPreview) {
            this.PreViewLiveDom = new LiveDomSender();
        }
        else {
            this.PreViewLiveDom = null;
        }
        this.ChangeLayerDOM(this.GetLiveDomSender());
    }

}
