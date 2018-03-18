import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import LinkUtil from "../../Base/Util/LinkUtil";
import StdUtil from "../../Base/Util/StdUtil";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import ChatStatusSender from "../../Contents/Sender/ChatStatusSender";
import CastPropController from "../CastProp/CastPropController";
import LiveDomVisitorController from "./LiveDomVisitorController";
import CastSubTitlesSender from "../../Contents/Sender/CastSubTitlesSender";
import LiveDomSender from "../../Contents/Sender/LiveDomSender";

/**
 * 
 */
export class LiveDomVisitorView extends AbstractServiceView<LiveDomVisitorController> {

    public Cursor: CastPropController;
    public LiveDom = new LiveDomSender();

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

        let video = document.getElementById('sbj-video') as HTMLVideoElement;
        let itemport = document.getElementById('sbj-livedom-item-port') as HTMLElement;
        let curport = document.getElementById('sbj-livedom-cursor-port') as HTMLElement;
        this.Cursor = new CastPropController(this.Controller, video, itemport, curport);
        this.Cursor.DisplayAll();

        MessageChannelUtil.SetChild(this.Controller, (sender) => {
            let cst = sender as ChatStatusSender;
            this.Cursor.SetChatStatus(cst);
        });
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