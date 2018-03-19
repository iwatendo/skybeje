import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";
import CastPropController from "../CastProp/CastPropController";
import LiveDomVisitorController from "./LiveDomVisitorController";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import LiveDomSender from "../../Contents/Sender/LiveDomSender";
import CursorDispOffset from "../CastProp/CursorDispOffset";
import CastSettingSender from "../../Contents/Sender/CastSettingSender";

/**
 * 
 */
export class LiveDomVisitorView extends AbstractServiceView<LiveDomVisitorController> {

    public Cursor: CastPropController;
    public LiveDom = new LiveDomSender();
    public static Offset = new CursorDispOffset();

    //
    public Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();
        StdUtil.StopTouchMove();
        StdUtil.StopTouchZoom();

        callback();
    }


    /**
     * カーソル表示設定
     */
    public InitializeCursor() {

        let contents = document.getElementById('sbj-livedom-visitor-contents') as HTMLElement;
        let itemport = document.getElementById('sbj-cast-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-cast-cursor-port') as HTMLElement;

        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return LiveDomVisitorView.Offset; }, () => { this.Risize(this.LiveDom); });
        this.Cursor.DisplayAll();

        MessageChannelUtil.SetChild(this.Controller, (sender) => {
            let cst = sender as ChatStatusSender;
            this.Cursor.SetChatStatus(cst);
        });
    }


    /**
     * 
     */
    public Risize(livedom: LiveDomSender) {
        if (livedom) {
            let contents = document.getElementById('sbj-livedom-visitor-contents') as HTMLElement;
            let liveDomLayer1 = document.getElementById('sbj-livedom-layer1');
            let liveDomLayer2 = document.getElementById('sbj-livedom-layer2');
            let liveDomLayer3 = document.getElementById('sbj-livedom-layer3');
            let liveDomLayer4 = document.getElementById('sbj-livedom-layer4');
            let aspect: number = livedom.aspectW / livedom.aspectH;

            LiveDomVisitorView.Offset = CursorDispOffset.GetAspectDispOffset(contents, aspect);
            CursorDispOffset.SetOffsetDiv(liveDomLayer1, LiveDomVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveDomLayer2, LiveDomVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveDomLayer3, LiveDomVisitorView.Offset, false);
            CursorDispOffset.SetOffsetDiv(liveDomLayer4, LiveDomVisitorView.Offset, true);
        }
    }


    /**
     * 埋込ページの変更
     * @param dom 
     */
    public SetLiveDom(dom: LiveDomSender) {
        this.SetLiveDomElement($("#sbj-livedom-layer1"), this.LiveDom.layerBackgroundB, dom.layerBackgroundB);
        this.SetLiveDomElement($("#sbj-livedom-layer2"), this.LiveDom.layerBackgroundF, dom.layerBackgroundF);
        this.SetLiveDomElement($("#sbj-livedom-layer3"), this.LiveDom.layerActive, dom.layerActive);
        this.SetLiveDomElement($("#sbj-livedom-layer4"), this.LiveDom.layerControl, dom.layerControl);
        this.LiveDom = dom;
        this.Risize(dom);
    }


    /**
     * 
     * @param element 
     * @param pre 
     * @param cur 
     */
    public SetLiveDomElement(element: JQuery, pre: string, cur: string) {
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