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

        this.Cursor = new CastPropController(this.Controller, itemport, curport, () => { return LiveDomVisitorView.Offset; }, this.Risize);
        this.Risize();
        this.Cursor.DisplayAll();

        MessageChannelUtil.SetChild(this.Controller, (sender) => {
            let cst = sender as ChatStatusSender;
            this.Cursor.SetChatStatus(cst);
        });
    }


    /**
     * 
     */
    public Risize() {
        let contents = document.getElementById('sbj-livedom-visitor-contents') as HTMLElement;
        let liveDomBack = document.getElementById('sbj-livedom-back');
        let liveDomFront = document.getElementById('sbj-livedom-front');
        let aspect: number = 8 / 5;

        LiveDomVisitorView.Offset = CursorDispOffset.GetAspectDispOffset(contents, aspect);
        CursorDispOffset.SetOffsetDiv(liveDomBack, LiveDomVisitorView.Offset, false);
        CursorDispOffset.SetOffsetDiv(liveDomFront, LiveDomVisitorView.Offset, true);
    }


    /**
     * 埋込ページの変更
     * @param dom 
     */
    public SetLiveDom(dom: LiveDomSender) {

        if (this.LiveDom.backhtml !== dom.backhtml) {
            $("#sbj-livedom-back").empty().append(dom.backhtml);
        }

        if (this.LiveDom.fronthtml !== dom.fronthtml) {
            $("#sbj-livedom-front").empty().append(dom.fronthtml);
        }

        this.LiveDom = dom;

    }


}