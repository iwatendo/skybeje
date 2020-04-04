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
     * フレーム番号
     */
    public FrameIndex: number;

    /**
     * 配信中か？
     */
    public IsCasting: boolean;


    /**
     * 配信タイトル
     */
    public Title: string = "";


    /**
     * 選択時イベント
     */
    public onselect: (() => any) | null;


    /**
     * 
     * @param controller 
     * @param frameIndex 
     */
    public constructor(controller: HomeVisitorController, frameIndex: number) {
        this._homeController = controller;
        this.Frame = document.getElementById("sbj-home-visitor-livecast-" + frameIndex.toString()) as HTMLFrameElement;
        this.FrameIndex = frameIndex;
    }


    public RemoveServent() {
        this.Frame.setAttribute('src', '');
        this.Title = "";
        this.IsCasting = false;
    }


    /**
     * 各コンポーネントにサーバントを設定
     * @param btnTitleElement 
     * @param btnIconElement 
     * @param toolTipElement 
     * @param servent 
     */
    public SetServent(servent: ServentSender) {
        this._homeController.ActorCache.GetActor(servent.ownerPeerid, servent.ownerAid, (actor) => {
            this.Title = this.GetDisplayNameStatus(servent) + " : " + actor.name;
        });

        this.IsCasting = true;
        this.SetFrame(this.Frame, servent);
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
     * 配信ステータスの表示
     * @param frameIndex 
     * @param servent 
     */
    private GetDisplayNameStatus(servent: ServentSender): string {

        let castTypeName = "";
        switch (servent.castType) {
            case CastTypeEnum.LiveCast:
                if (servent.instanceUrl.indexOf('mobile') >= 0) {
                    castTypeName = "ライブキャスト（モバイル）";
                }
                else {
                    castTypeName = "ライブキャスト";
                }
                break;
            case CastTypeEnum.ScreenShare: castTypeName = "スクリーンシェア"; break;
            case CastTypeEnum.Gadget: castTypeName = "YouTube同期再生"; break;
            case CastTypeEnum.LiveHTML: castTypeName = "ライブHTML"; break;
        }

        return castTypeName;
    }

}
