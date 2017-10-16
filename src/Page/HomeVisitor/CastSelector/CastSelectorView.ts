
import HomeVisitorController from "../HomeVisitorController";
import CastSelectorController from "./CastSelectorController";
import { RoomServentSender, ServentSender } from "../../HomeInstance/HomeInstanceContainer";
import ActorCache from "../Cache/ActorCache";
import { CastTypeEnum } from "../../../Base/Container/CastInstanceSender";
import ServentElementPack from "./ServentElementPack";


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

    private _isLayoutMode = false;
    private _dispFrameCount = 1;
    private _dispFrameArray = new Array<number>();

    private _servnetElementPacks = new Array<ServentElementPack>();

    public GetFrame(frameIndex: number): HTMLFrameElement {
        return this._servnetElementPacks[frameIndex].Frame;
    }


    /**
     * コンスとタクタ
     * @param controller 
     * @param castSelectorController 
     */
    constructor(controller: HomeVisitorController, castSelectorController: CastSelectorController) {

        this._homeController = controller;
        this._castSelectorController = castSelectorController;

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {

            let slp = new ServentElementPack(controller, i);
            this._servnetElementPacks.push(slp);

            slp.Frame.onload = (ev) => {
                this._castSelectorController.NotifyServentToActor(slp.Frame);
            }

            slp.Button.onclick = (ev) => {
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
     * @param frameIndex 
     * @param servent 
     */
    public SetServentFrame(frameIndex: number, servent: ServentSender) {

        let slp = this._servnetElementPacks[frameIndex];

        if (servent) {
            slp.SetServent(servent);

            if (this._dispFrameCount < this._dispFrameArray.length) {
                this._dispFrameArray.push(frameIndex);
                this.SetCastFrame();
            }
        }
    }


    /**
     * 指定フレームのサーバントをクリア
     * @param frameIndex 
     */
    public RemoveServentFrame(frameIndex: number) {

        let slp = this._servnetElementPacks[frameIndex];
        slp.RemoveServent();

        if (this._dispFrameArray.length > 0) {
            this._dispFrameArray = this._dispFrameArray.filter((i) => (i !== frameIndex));
        }
        this.SetCastFrame();
    }


    /**
     * アクティブボタンが閉じられた場合、表示されている先頭タブをアクティブにする
     */
    public CheckChangeActiveFrame() {

        let first: HTMLElement = null;

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {

            let slp = this._servnetElementPacks[i];

            if (slp.Button.hidden)
                continue;

            if (slp.Frame.hidden) {
                return;
            }

            if (!first)
                first = slp.Button;
        }

        if (first)
            first.click();
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
            let slp = this._servnetElementPacks[i];
            slp.Status.hidden = !(this._isLayoutMode && slp.IsDispStatus());
        }
    }


    /**
     * 表示するサーバント件数を変更します
     * @param serventCount 
     */
    public ChangeDisplayFrameCount(serventCount: number) {
        this._dispFrameCount = this.ToDispFrameCount(serventCount);
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
     * @param serventCount 
     */
    private ToDispFrameCount(serventCount: number) {
        if (serventCount >= 3) return 4;
        if (serventCount >= 2) return 2;
        if (serventCount >= 1) return 1;
        return 0;
    }


    /**
     * キャスト中かつ非表示のフレーム番号を取得
     */
    private GetNoDispFrameIndex(): number {

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {
            let frameElement = this._servnetElementPacks[i].Frame;
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

        for (let frameIndex = 0; frameIndex < this._homeController.View.CastSelector.FrameCount; frameIndex++) {
            let slp = this._servnetElementPacks[frameIndex];
            slp.Frame.hidden = true;
            slp.Status.hidden = true;
            slp.Button.removeAttribute('disabled');
        }

        let displayLabel = "";

        for (let dispIndex = 0; dispIndex < this._dispFrameArray.length; dispIndex++) {
            let frameIndex = this._dispFrameArray[dispIndex];
            let slp = this._servnetElementPacks[frameIndex];
            this.SetFrameStatus(dispIndex, frameIndex, slp);
            slp.Button.setAttribute('disabled', "1");
        }
    }


    /**
     * キャストフレームとステータスの表示位置設定
     * @param dispIndex 
     * @param frameIndex
     * @param slp 
     */
    private SetFrameStatus(dispIndex: number, frameIndex: number, slp: ServentElementPack) {

        slp.Frame.hidden = false;
        slp.Frame.style.position = "absolute";
        slp.Frame.style.zIndex = "2";
        slp.Frame.style.height = "calc(" + (this._dispFrameCount > 1 ? "50%" : "100%") + " - 8px)";
        slp.Frame.style.width = "calc(" + (this._dispFrameCount > 2 ? "50%" : "100%") + " - 8px)";

        slp.Status.hidden = (!this._isLayoutMode);
        slp.Status.style.position = "absolute";
        slp.Status.style.zIndex = "3";

        let topPos = "0px";
        let leftPos = "0px";

        switch (this._dispFrameCount) {
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

        slp.Frame.style.top = topPos;
        slp.Frame.style.left = leftPos;
        slp.Status.style.top = topPos;
        slp.Status.style.left = leftPos;
    }

}