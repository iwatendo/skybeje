import { ServentSender } from "../../HomeInstance/HomeInstanceContainer";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";
import HomeVisitorController from "../HomeVisitorController";



export default class ServentElementPack {

    private _homeController: HomeVisitorController;

    public Frame: HTMLFrameElement;
    public Status: HTMLElement;
    public Button: HTMLElement;
    public Title: HTMLElement;
    public Icon: HTMLElement;


    /**
     * 対象のフレームが配信中か？
     */
    public get IsCasting() {
        //  ボタンの表示非表示状態で判定
        return !this.Button.hidden;
    }

    /**
     * 
     * @param controller 
     * @param frameIndex 
     */
    public constructor(controller: HomeVisitorController, frameIndex: number) {
        this._homeController = controller;
        this.Frame = document.getElementById("sbj-home-visitor-livecast-" + frameIndex.toString()) as HTMLFrameElement;
        this.Status = document.getElementById("sbj-home-visitor-livecast-status-" + frameIndex.toString()) as HTMLElement;
        this.Button = document.getElementById("sbj-home-visitor-livecast-select-" + frameIndex.toString());
        this.Title = document.getElementById("sbj-home-visitor-livecast-select-title-" + frameIndex.toString());
        this.Icon = document.getElementById("sbj-home-visitor-livecast-select-icon-" + frameIndex.toString());
    }


    public RemoveServent() {
        this.Frame.setAttribute('src', '');
        this.Status.textContent = "";
        this.Button.hidden = true;
        this.Icon.textContent = "";
        this.Title.textContent = "";
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
            this.Title.textContent = actor.name;
            this.Icon.textContent = this.GetCastIconName(servent.castType);
        });

        this.Button.hidden = false;
        this.Status.textContent = this.GetDisplayNameStatus(servent);
        this.SetServentMain(this.Frame, servent);
    }


    /**
     * フレームにサーバントを設定
     * @param servent 
     */
    private SetServentMain(frame: HTMLFrameElement, servent: ServentSender) {

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
                this._homeController.View.CastSelector.NotifyServentToActor(frame);
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

        let name = this.Title.textContent;
        let castTypeName = "";
        switch (servent.castType) {
            case CastTypeEnum.LiveCast:
                if (servent.instanceUrl.indexOf('mobile') >= 0) {
                    castTypeName = "モバイル配信";
                }
                else {
                    castTypeName = "ライブ配信";
                }
                break;
            case CastTypeEnum.ScreenShare: castTypeName = "画面共有"; break;
            case CastTypeEnum.Gadget: castTypeName = "ガジェット配信"; break;
        }

        return name + "：" + castTypeName;
    }


    /**
     * キャスト名称の取得
     * @param servent 
     */
    private GetCastIconName(castType: CastTypeEnum) {
        switch (castType) {
            case CastTypeEnum.LiveCast: return "videocam";
            case CastTypeEnum.ScreenShare: return "screen_share";
            case CastTypeEnum.Gadget: return "ondemand_video";
        }
    }


    /**
     * ステータスの表示判定
     */
    public IsDispStatus(): boolean {

        //  フレームが非表示の場合はステータスも表示しない
        if (this.Frame.hidden) {
            return false;
        }

        //  文言が設定されている場合のみ表示する
        return (this.Status && this.Status.textContent.length > 0);
    }

}
