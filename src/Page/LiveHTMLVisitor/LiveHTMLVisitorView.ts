import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";
import CastPropController from "../CastProp/CastPropController";
import LiveHTMLVisitorController from "./LiveHTMLVisitorController";
import LiveHTMLSender from "../../Contents/Sender/LiveHTMLSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";
import { EmbedPage, CtrlLayerEnum } from "../../Contents/IndexedDB/LiveHTML";

/**
 * 
 */
export class LiveHTMLVisitorView extends AbstractServiceView<LiveHTMLVisitorController> {

    public Cursor: CastPropController;
    public LiveHTML = new LiveHTMLSender();
    public static Offset = new CursorDispOffset();

    //
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        StdUtil.StopTouchZoom();

        //  リロードボタン
        let reloadButton = document.getElementById('sbj-reload-button') as HTMLButtonElement;
        reloadButton.hidden = StdUtil.IsMobile();   //  モバイル端末の場合は非表示
        reloadButton.onclick = (e) => { location.reload(); }

        callback();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {

        let contents = document.getElementById('sbj-livehtml-visitor-main') as HTMLElement;
        let itemport = document.getElementById('sbj-item-layer') as HTMLElement;
        let curport = document.getElementById('sbj-cursor-layer') as HTMLElement;

        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return LiveHTMLVisitorView.Offset; }, () => { this.Risize(this.LiveHTML); });

        MessageChannelUtil.SetChild(this.Controller, (sender) => {
            let cst = sender as ChatStatusSender;
            this.Cursor.SetChatStatus(cst);
        });
    }


    /**
     * 
     */
    public Risize(livehtml: LiveHTMLSender) {

        if (livehtml) {

            let mainElement = document.getElementById('sbj-livehtml-visitor-main') as HTMLElement;
            let liveHtmlContents = document.getElementById('sbj-livehtml-contents') as HTMLElement;
            let liveHtmlLayer1 = document.getElementById('sbj-backgroundB-layer');
            let liveHtmlLayer2 = document.getElementById('sbj-backgroundF-layer');
            let liveHtmlLayer3 = document.getElementById('sbj-active-layer');
            let liveHtmlLayer4 = document.getElementById('sbj-cotrol-layer');

            let aspect: number = (livehtml.isAspectFix ? livehtml.aspectW / livehtml.aspectH : 0);

            let ctrlHeight = (livehtml.ctrlLayerMode === CtrlLayerEnum.Show ? 52 : 0);
            liveHtmlContents.style.height = "calc(100% - " + ctrlHeight + "px)";

            let ctrlAreaOffset = CursorDispOffset.GetAspectDispOffset(mainElement.clientWidth, mainElement.clientHeight, 0);
            let dispAreaOffset = CursorDispOffset.GetAspectDispOffset(liveHtmlContents.clientWidth, liveHtmlContents.clientHeight, aspect);

            CursorDispOffset.SetOffsetDiv(liveHtmlLayer1, dispAreaOffset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer2, dispAreaOffset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer3, dispAreaOffset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer4, ctrlAreaOffset, true);

            LiveHTMLVisitorView.Offset = dispAreaOffset;

        }

        if (this.Cursor) {
            this.Cursor.DisplayAll();
        }
    }


    /**
     * 埋込ページの変更
     * @param livehtml 
     */
    public SetLiveHTML(livehtml: LiveHTMLSender) {
        this.SetLiveHTMLElement($("#sbj-backgroundB-layer"), this.LiveHTML.layerBackgroundB, livehtml.layerBackgroundB);
        this.SetLiveHTMLElement($("#sbj-backgroundF-layer"), this.LiveHTML.layerBackgroundF, livehtml.layerBackgroundF);
        this.SetLiveHTMLElement($("#sbj-active-layer"), this.LiveHTML.layerActive, livehtml.layerActive);
        this.SetLiveHTMLElement($("#sbj-cotrol-layer"), this.LiveHTML.layerControl, livehtml.layerControl);
        this.LiveHTML = livehtml;

        let submenu = document.getElementById('sbj-control-contents') as HTMLElement;
        let mout_opacity = (livehtml.ctrlLayerMode === CtrlLayerEnum.Overlay ? "0.0" : "1.0");
        submenu.hidden = (livehtml.ctrlLayerMode === CtrlLayerEnum.Hide);

        submenu.onmouseover = (e) => { submenu.style.opacity = "1.0"; }
        submenu.onmouseout = (e) => { submenu.style.opacity = mout_opacity; }
        submenu.style.opacity = mout_opacity;

        this.Risize(livehtml);
    }


    /**
     * 
     * @param element 
     * @param pre 
     * @param cur 
     */
    public SetLiveHTMLElement(element: JQuery, pre: string, cur: string) {
        if (pre !== cur) {
            let html = EmbedPage.ReplasePeerId(cur, LinkUtil.GetPeerID());
            element.empty().show().append(html);
        }

        if (cur.trim().length === 0) {
            element.hide();
        }
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