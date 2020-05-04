import { CastTypeEnum } from "../../../Base/Container/CastStatusSender";
import HomeVisitorController from "../HomeVisitorController";
import ServentSender from "../../../Contents/Sender/ServentSender";


/**
 * 
 */
export default class ServentFrame {

    /**
     * チャットクライアントのコントローラー
     */
    private _homeController: HomeVisitorController;

    /**
     * サーバント表示用のフレーム
     */
    public Frame: HTMLFrameElement;

    /**
     * フレーム番号(0～3)
     */
    public FrameNo: number;

    /**
     * 配信中か？
     */
    public IsCasting: boolean;


    /**
     * 配信タイトル
     */
    public Title: string = "";


    /**
     * 
     * @param controller 
     * @param frameIndex 
     */
    public constructor(controller: HomeVisitorController, frameIndex: number) {
        this._homeController = controller;
        this.Frame = document.getElementById("sbj-home-visitor-livecast-" + frameIndex.toString()) as HTMLFrameElement;
        this.FrameNo = frameIndex;
    }

    /**
     * 各コンポーネントにサーバントを設定
     * @param btnTitleElement 
     * @param btnIconElement 
     * @param toolTipElement 
     * @param servent 
     */
    public Set(servent: ServentSender) {
        this._homeController.ActorCache.GetActor(servent.ownerPeerid, servent.ownerAid, (actor) => {
            this.Title = this.GetDisplayNameStatus(servent) + " : " + actor.name;
        });

        this.IsCasting = true;
        this.SetFrame(this.Frame, servent);
    }


    /**
     * 
     */
    public Clear() {
        this.Frame.setAttribute('src', '');
        this.Title = "";
        this.IsCasting = false;
    }


    /**
     * フレームにサーバントを
     * @param servent 
     */
    private SetFrame(frame: HTMLFrameElement, servent: ServentSender) {

        if (servent.hid !== this._homeController.CurrentHid) {
            return;
        }

        let url: string = servent.clientUrl;

        if (servent.ownerPeerid === this._homeController.PeerId) {
            //  自分が起動したキャストの場合、ミュート状態で起動する
            url += "&mute=1";
        }

        //  URLの変更があった場合のみ設定する
        let preUrl = frame.getAttribute('src');

        if (preUrl !== url) {
            frame.onload = (e) => {
                //  エンターキー押下時に、テキストボックスにフォーカスが移るようにする
                frame.contentDocument.onkeyup = this._homeController.View.InputPane.OnOtherKeyPress;
                frame.contentDocument.onmouseover = (e) => {
                    frame.contentWindow.document.body.focus();
                }
            }
            frame.setAttribute('src', url);
        }
    }


    /**
     * キャストフレームとステータスの表示位置設定
     * @param dispIndex 
     * @param dispFrameCount 
     */
    public SetLayout(dispIndex: number, dispFrameCount: number) {

        this.Frame.hidden = false;
        this.Frame.style.position = "absolute";
        this.Frame.style.zIndex = "2";
        this.Frame.style.height = "calc(" + (dispFrameCount > 1 ? "50%" : "100%") + " - 8px)";
        this.Frame.style.width = "calc(" + (dispFrameCount > 2 ? "50%" : "100%") + " - 8px)";

        let topPos = "0px";
        let leftPos = "0px";

        switch (dispFrameCount) {
            case 1:
            case 2:
                switch (dispIndex) {
                    case 1: topPos = "50%"; break;
                }
                break;
            case 4:
                switch (dispIndex) {
                    case 0: topPos = "0px"; leftPos = "0px"; break;
                    case 1: topPos = "50%"; leftPos = "0px"; break;
                    case 2: topPos = "0px"; leftPos = "50%"; break;
                    case 3: topPos = "50%"; leftPos = "50%"; break;
                }
                break;
        }

        this.Frame.style.top = topPos;
        this.Frame.style.left = leftPos;
    }


    /**
     * 配信ステータスの表示
     * @param frameIndex 
     * @param servent 
     */
    private GetDisplayNameStatus(servent: ServentSender): string {

        let castTypeName = "";
        switch (servent.castType) {
            case CastTypeEnum.LiveCast:
                if (servent.instanceUrl.indexOf('mobile') >= 0) {
                    castTypeName = "プライベート配信（モバイル）";
                }
                else {
                    castTypeName = "プライベート配信";
                }
                break;
            case CastTypeEnum.ScreenShare: castTypeName = "スクリーンシェア"; break;
            case CastTypeEnum.Gadget: castTypeName = "YouTube同期再生"; break;
            case CastTypeEnum.LiveHTML: castTypeName = "ライブHTML"; break;
        }

        return castTypeName;
    }

}
