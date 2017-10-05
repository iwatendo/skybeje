
import HomeVisitorController from "../HomeVisitorController";
import CastSelectorController from "./CastSelectorController";
import { RoomServantSender, ServantSender } from "../../HomeInstance/HomeInstanceContainer";
import ActorCache from "../Cache/ActorCache";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";


export default class CastSelectorView {

    private _homeController: HomeVisitorController;
    private _castSelectorController: CastSelectorController;

    private _castSelectorElement = document.getElementById('sbj-home-visitor-castselect-pane');
    private _castFrameElement = document.getElementById('sbj-home-visitor-castfrmae-pane');
    private _layoutButton = document.getElementById('sbj-home-visitor-livecast-layout');
    private _layoutButtonIcon = document.getElementById('sbj-home-visitor-livecast-layout-icon');
    private _layoutButton1 = document.getElementById('sbj-home-visitor-livecast-layout-1');
    private _layoutButton2 = document.getElementById('sbj-home-visitor-livecast-layout-2');
    private _layoutButton4 = document.getElementById('sbj-home-visitor-livecast-layout-4');
    private _livecastStatus = document.getElementById('sbj-home-visitor-livecast-display-status-label');

    private _selectServant: string;
    private _isLayoutMode = false;
    private _dispFrameCount = 1;
    private _dispFrameArray = new Array<number>();


    /**
     * コンスとタクタ
     * @param controller 
     * @param castSelectorController 
     */
    constructor(controller: HomeVisitorController, castSelectorController: CastSelectorController) {

        this._homeController = controller;
        this._castSelectorController = castSelectorController;

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {

            let button = this.GetSelectButtonElement(i);
            let element = this.GetFrmaeElement(i);

            element.onload = (ev) => {
                this._castSelectorController.NotifyServantToActor(element);
            }

            button.onclick = (ev) => {
                let index = i;
                this.LiveCastSelectClick(index);
            }

        }

        this._layoutButton.onclick = (ev) => { this.ChangeLayout() };
        this._layoutButton1.onclick = (ev) => { this.ChangeDisplayFrameCount(1); };
        this._layoutButton2.onclick = (ev) => { this.ChangeDisplayFrameCount(2); };
        this._layoutButton4.onclick = (ev) => { this.ChangeDisplayFrameCount(4); };
    }


    /**
     * 指定したフレームにサーバントを設定します。
     * @param dispIndex 
     * @param servant 
     */
    public SetServantFrame(dispIndex: number, servant: ServantSender) {

        let frameElement = this.GetFrmaeElement(dispIndex);
        let frameStatusElement = this.GetFrameStatusElement(dispIndex);
        let btnElement = this.GetSelectButtonElement(dispIndex);
        let btnTitleElement = this.GetSelectButtonTitleElement(dispIndex);
        let btnIconElement = this.GetSelectButtonIconElement(dispIndex);

        if (servant) {
            this.SetButton(btnTitleElement, btnIconElement, servant);
            btnElement.hidden = false;
            frameStatusElement.textContent = this.GetDisplayNameStatus(dispIndex, servant);
            this.SetServant(frameElement, servant);

            if (this._dispFrameCount < this._dispFrameArray.length) {
                this._dispFrameArray.push(dispIndex);
                this.SetCastFrame();
            }
        }
    }


    /**
     * 指定フレームのサーバントをクリア
     * @param index 
     */
    public RemoveServantFrame(index: number) {

        let frameElement = this.GetFrmaeElement(index);
        let frameStatusElement = this.GetFrameStatusElement(index);
        let btnElement = this.GetSelectButtonElement(index);

        btnElement.hidden = true;
        frameElement.setAttribute('src', '');
        frameStatusElement.textContent = "";
        if (this._dispFrameArray.length > 0) {
            this._dispFrameArray = this._dispFrameArray.filter((i) => (i !== index));
        }
        this.SetCastFrame();
    }


    /**
     * アクティブボタンが閉じられた場合、表示されている先頭タブをアクティブにする
     */
    public CheckChangeActiveFrame() {

        let first: HTMLElement = null;

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {

            let frame = this.GetFrmaeElement(i);
            let button = this.GetSelectButtonElement(i);

            if (button.hidden)
                continue;

            if (!frame.hidden) {
                return;
            }

            if (!first)
                first = button;
        }

        if (first)
            first.click();
    }


    /**
     * サーバントの表示切替
     * @param servant 
     */
    public SetServant(element: HTMLFrameElement, servant: ServantSender) {

        if (servant.hid !== this._homeController.CurrentHid) {
            return;
        }

        this._selectServant = servant.servantPeerId;

        let url: string = servant.clientUrl;

        if (servant.ownerPeerid === this._homeController.PeerId) {
            //  自分が起動したキャストの場合、ミュート状態で起動する
            url += "&mute=1";
        }

        //  URLの変更があった場合のみ設定する
        let preUrl = element.getAttribute('src');

        if (preUrl !== url) {
            element.onload = (e) => {
                //  エンターキー押下時に、テキストボックスにフォーカスが移るようにする
                element.contentDocument.onkeyup = this._homeController.View.InputPane.OnOtherKeyPress;

                element.contentDocument.onmouseover = (e) => {
                    element.contentWindow.document.body.focus();
                }
                this._homeController.View.CastSelector.NotifyServantToActor(element);
            }
            element.setAttribute('src', url);
        }

    }


    /**
     * 
     * @param btnTitleElement 
     * @param btnIconElement 
     * @param toolTipElement 
     * @param servant 
     */
    private SetButton(btnTitleElement: HTMLElement, btnIconElement: HTMLElement, servant: ServantSender) {
        this._homeController.ActorCache.GetActor(servant.ownerPeerid, servant.ownerAid, (actor) => {
            btnTitleElement.textContent = actor.name;
            btnIconElement.textContent = this.GetCastIconName(servant.castType);
        });
    }


    /**
     * キャスト名称の取得
     * @param servant 
     */
    private GetCastIconName(castType: CastTypeEnum) {
        switch (castType) {
            case CastTypeEnum.LiveCast: return "videocam";
            case CastTypeEnum.ScreenShare: return "screen_share";
            case CastTypeEnum.Gadget: return "ondemand_video";
        }
    }


    /**
     * 表示するライブキャストのボタン
     * @param index 
     */
    private LiveCastSelectClick(index: number) {

        let isDisp = false;

        this._dispFrameArray.forEach((pre) => {
            if (pre === index) {
                isDisp = true;
            }
        });

        //  表示済みの場合は何も処理しない
        if (isDisp)
            return;

        //  未表示キャストが選択された場合は最後尾に追加
        this._dispFrameArray.push(index);

        if (this._dispFrameArray.length > this._dispFrameCount) {
            this._dispFrameArray = this._dispFrameArray.slice(1);
        }

        this.SetCastFrame();
    }


    /**
     * レイアウト変更
     */
    private ChangeLayout() {
        this._isLayoutMode = !this._isLayoutMode;
        let isMenuHide = !this._isLayoutMode;
        this._layoutButtonIcon.textContent = (this._isLayoutMode ? "fullscreen" : "settings");

        this._castSelectorElement.hidden = isMenuHide;
        this._layoutButton1.hidden = isMenuHide;
        this._layoutButton2.hidden = isMenuHide;
        this._layoutButton4.hidden = isMenuHide;
        let xpx = (this._isLayoutMode ? 64 : 0).toString() + "px";
        let ypx = (this._isLayoutMode ? 48 : 0).toString() + "px";
        this._castFrameElement.style.left = xpx;
        this._castFrameElement.style.top = ypx;
        this._castFrameElement.style.width = "calc(100% - " + xpx + ")"
        this._castFrameElement.style.height = "calc(100% - " + ypx + ")"

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {
            let frameStatusElement = this.GetFrameStatusElement(i);
            frameStatusElement.hidden = !this.IsDispFrameStatus(i);
        }
    }


    /**
     * 表示するサーバント件数を変更します
     * @param servantCount 
     */
    public ChangeDisplayFrameCount(servantCount: number) {
        this._dispFrameCount = this.ToDispFrameCount(servantCount);
        this._dispFrameArray = this._dispFrameArray.slice(0, this._dispFrameCount);

        while (this._dispFrameArray.length < this._dispFrameCount) {
            let index = this.GetNoDispFrameIndex();
            if (index >= 0) {
                this._dispFrameArray.push(index);
            }
            else {
                break;
            }
        }

        this.SetCastFrame();
    }


    /**
     * 
     * @param servantCount 
     */
    private ToDispFrameCount(servantCount: number) {
        if (servantCount >= 3) return 4;
        if (servantCount >= 2) return 2;
        if (servantCount >= 1) return 1;
        return 0;
    }


    /**
     * キャスト中かつ非表示のフレーム番号を取得
     */
    private GetNoDispFrameIndex(): number {

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {
            let frameElement = this.GetFrmaeElement(i);
            let isCast = (frameElement.src.length > 0);

            if (isCast) {
                let pre = this._dispFrameArray.filter(n => (n === i));

                if (pre.length === 0) {
                    return i;
                }
            }
        }

        return -1;
    }


    /**
     * 
     */
    private SetCastFrame() {

        for (let i = 0; i < this._homeController.View.CastSelector.FrameCount; i++) {
            let frameElement = this.GetFrmaeElement(i);
            let frameStatusElement = this.GetFrameStatusElement(i);
            let button = this.GetSelectButtonElement(i);
            frameElement.hidden = true;
            frameStatusElement.hidden = true;
            button.removeAttribute('disabled');
        }

        let displayLabel = "";

        for (let dispIndex = 0; dispIndex < this._dispFrameArray.length; dispIndex++) {
            let frameIndex = this._dispFrameArray[dispIndex];
            let frameElement = this.GetFrmaeElement(frameIndex);
            let frameStatusElement = this.GetFrameStatusElement(frameIndex);
            let button = this.GetSelectButtonElement(frameIndex);

            this.SetFrameStatus(dispIndex, frameElement, frameStatusElement);
            button.setAttribute('disabled', "1");
        }
    }


    /**
     * 
     * @param dispIndex 
     */
    private IsDispFrameStatus(dispIndex: number): boolean {

        //  レイアウトモードの場合のみ表示
        if (this._isLayoutMode) {
            let element = this.GetFrameStatusElement(dispIndex);
            //  文言が設定されている場合のみ表示
            if (element && element.textContent.length > 0) {
                //  対応するフレームが表示されている場合のみ表示
                let frameIndex = this._dispFrameArray[dispIndex];
                if( frameIndex >= 0){
                    let frame = this.GetFrmaeElement(frameIndex);
                    if (!frame.hidden) {
                        return true;
                    }
                }
            }
        }

        return false;
    }


    /**
     * 
     * @param dispPos 
     * @param element 
     */
    private SetFrameStatus(dispPos: number, element: HTMLFrameElement, statusElement: HTMLElement) {

        element.hidden = false;
        element.style.position = "absolute";
        element.style.zIndex = "2";
        element.style.height = "calc(" + (this._dispFrameCount > 1 ? "50%" : "100%") + " - 8px)";
        element.style.width = "calc(" + (this._dispFrameCount > 2 ? "50%" : "100%") + " - 8px)";

        statusElement.hidden = !this.IsDispFrameStatus(dispPos);
        statusElement.style.position = "absolute";
        statusElement.style.zIndex = "3";

        let topPos = "0px";
        let leftPos = "0px";

        switch (this._dispFrameCount) {
            case 1:
            case 2:
                switch (dispPos) {
                    case 1: topPos = "50%"; break;
                }
                break;
            case 4:
                switch (dispPos) {
                    case 0: topPos = "0px"; leftPos = "0px"; break;
                    case 1: topPos = "50%"; leftPos = "0px"; break;
                    case 2: topPos = "0px"; leftPos = "50%"; break;
                    case 3: topPos = "50%"; leftPos = "50%"; break;
                }
                break;
        }

        element.style.top = topPos;
        element.style.left = leftPos;
        statusElement.style.top = topPos;
        statusElement.style.left = leftPos;
    }


    /**
     * 配信ステータスの表示
     * @param dispIndex 
     * @param servant 
     */
    private GetDisplayNameStatus(dispIndex: number, servant: ServantSender): string {

        let name = this.GetSelectButtonTitleElement(dispIndex).textContent;
        let castTypeName = "";
        switch (servant.castType) {
            case CastTypeEnum.LiveCast:
                if (servant.instanceUrl.indexOf('mobile') >= 0) {
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
     * 
     * @param index 
     */
    public GetFrmaeElement(index: number): HTMLFrameElement {
        return document.getElementById("sbj-home-visitor-livecast-" + index.toString()) as HTMLFrameElement;
    }


    /**
     * 
     * @param index 
     */
    public GetFrameStatusElement(index: number): HTMLElement {
        return document.getElementById("sbj-home-visitor-livecast-status-" + index.toString()) as HTMLElement;
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonTitleElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-title-" + index.toString());
    }


    /**
     * 
     * @param index 
     */
    private GetSelectButtonIconElement(index: number) {
        return document.getElementById("sbj-home-visitor-livecast-select-icon-" + index.toString());
    }

}