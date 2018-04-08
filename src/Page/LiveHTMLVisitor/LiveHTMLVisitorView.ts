import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";
import CastPropController from "../CastProp/CastPropController";
import LiveHTMLVisitorController from "./LiveHTMLVisitorController";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import LiveHTMLSender from "../../Contents/Sender/LiveHTMLSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";

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


        let submenu = document.getElementById('sbj-cast-submenu') as HTMLElement;
        submenu.onmouseover = (e) => { submenu.style.opacity = "1.0"; }
        submenu.onmouseout = (e) => { submenu.style.opacity = "0.0"; }
        submenu.style.opacity = "0.0";

        //  リロード処理
        document.getElementById('sbj-cast-reload').onclick = (e) => {
            location.reload();
        }

        callback();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {

        let contents = document.getElementById('sbj-livehtml-visitor-contents') as HTMLElement;
        let itemport = document.getElementById('sbj-cast-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-cast-cursor-port') as HTMLElement;

        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return LiveHTMLVisitorView.Offset; }, () => { this.Risize(this.LiveHTML); });
        this.Cursor.DisplayAll();

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
            let contents = document.getElementById('sbj-livehtml-visitor-contents') as HTMLElement;
            let liveHtmlLayer1 = document.getElementById('sbj-livehtml-layer1');
            let liveHtmlLayer2 = document.getElementById('sbj-livehtml-layer2');
            let liveHtmlLayer3 = document.getElementById('sbj-livehtml-layer3');
            let liveHtmlLayer4 = document.getElementById('sbj-livehtml-layer4');
            let aspect: number = (livehtml.isAspectFix ? livehtml.aspectW / livehtml.aspectH : 0);

            LiveHTMLVisitorView.Offset = CursorDispOffset.GetAspectDispOffset(contents, aspect);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer1, LiveHTMLVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer2, LiveHTMLVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer3, LiveHTMLVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveHtmlLayer4, LiveHTMLVisitorView.Offset, true);

            document.getElementById('sbj-cast-submenu').hidden = !livehtml.isDispControlLayer;
        }
    }


    /**
     * 埋込ページの変更
     * @param dom 
     */
    public SetLiveHTML(dom: LiveHTMLSender) {
        this.SetLiveHTMLElement($("#sbj-livehtml-layer1"), this.LiveHTML.layerBackgroundB, dom.layerBackgroundB);
        this.SetLiveHTMLElement($("#sbj-livehtml-layer2"), this.LiveHTML.layerBackgroundF, dom.layerBackgroundF);
        this.SetLiveHTMLElement($("#sbj-livehtml-layer3"), this.LiveHTML.layerActive, dom.layerActive);
        this.SetLiveHTMLElement($("#sbj-livehtml-layer4"), this.LiveHTML.layerControl, dom.layerControl);
        this.LiveHTML = dom;
        this.Risize(dom);
    }


    /**
     * 
     * @param element 
     * @param pre 
     * @param cur 
     */
    public SetLiveHTMLElement(element: JQuery, pre: string, cur: string) {
        if (pre !== cur) {
            element.empty().show().append(cur);
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