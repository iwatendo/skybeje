import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";
import CastSelectorController from "./CastSelectorController";
import ServentFrame from "./ServentFrame";
import ServentListComponent from './ServentListComponent';
import StdUtil from '../../../Base/Util/StdUtil';
import ServentSender from '../../../Contents/Sender/ServentSender';


/**
 * 配信表示
 */
export default class CastSelectorView {

    private _castListDispElement = document.getElementById('sbj-home-visitor-servent-list-disp');
    private _castListElement = document.getElementById('sbj-home-visitor-servent-list');

    private _homeController: HomeVisitorController;
    private _castSelectorController: CastSelectorController;
    private _dispFrameCount = 1;
    private _dispFrameArray = new Array<number>();
    private _serventFrameList = new Array<ServentFrame>();

    /**
     * コンストラクタ
     * @param controller 
     * @param castSelectorController 
     */
    constructor(controller: HomeVisitorController, castSelectorController: CastSelectorController) {

        this._homeController = controller;
        this._castSelectorController = castSelectorController;

        for (let idx = 0; idx < this._castSelectorController.FrameCount; idx++) {

            let sf = new ServentFrame(controller, idx);

            sf.onselect = () => {
                this.LiveCastSelectClick(sf.FrameIndex);
            }

            this._serventFrameList.push(sf);
        }
    }


    /**
     * 
     * @param frameIndex 
     */
    public GetFrame(frameIndex: number): HTMLFrameElement {
        return this._serventFrameList[frameIndex].Frame;
    }


    /**
     * 指定したフレームにサーバントを設定します。
     * @param frameIndex 
     * @param servent 
     */
    public SetServentFrame(frameIndex: number, servent: ServentSender) {

        let slp = this._serventFrameList[frameIndex];

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

        let slp = this._serventFrameList[frameIndex];
        slp.RemoveServent();

        if (this._dispFrameArray.length > 0) {
            //  フレーム番号と表示番号の対応表の更新
            let newArray = new Array<number>();
            this._dispFrameArray.filter((i) => (i !== frameIndex)).forEach((i) => { newArray.push(i); });
            this._dispFrameArray = newArray;
        }
        this.SetCastFrame();
    }


    /**
     * アクティブボタンが閉じられた場合、表示されている先頭タブをアクティブにする
     */
    public CheckChangeActiveFrame() {

        for (let i = 0; i < this._castSelectorController.FrameCount; i++) {

            let slp = this._serventFrameList[i];

            if (slp.IsCasting)
                continue;

            if (slp.Frame.hidden) {
                return;
            }

            slp.onselect();
            return;
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

            let sep = this._serventFrameList[i];
            if (sep.IsCasting) {
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

        //  配信状態のサービスがあるか？
        let isCasting = false;

        for (let frameIndex = 0; frameIndex < this._homeController.View.CastSelector.FrameCount; frameIndex++) {
            let sf = this._serventFrameList[frameIndex];
            sf.Frame.hidden = true;

            if (sf.IsCasting) {
                isCasting = true;
            }
        }

        //  配信中サービス一覧ボタンの表示／非表示切替
        //  ※１つでも配信中のサービスがあれば表示する
        this._castListDispElement.hidden = !isCasting;

        let key = StdUtil.CreateUuid();
        ReactDOM.render(<ServentListComponent
            key={key}
            controller={this._castSelectorController}
            servents={this._serventFrameList} />
            , this._castListElement);


        for (let dispIndex = 0; dispIndex < this._dispFrameArray.length; dispIndex++) {
            let frameIndex = this._dispFrameArray[dispIndex];
            let slp = this._serventFrameList[frameIndex];
            this.SetFrameStatus(dispIndex, frameIndex, slp);
        }

    }


    /**
     * キャストフレームとステータスの表示位置設定
     * @param dispIndex 
     * @param frameIndex
     * @param slp 
     */
    private SetFrameStatus(dispIndex: number, frameIndex: number, slp: ServentFrame) {

        slp.Frame.hidden = false;
        slp.Frame.style.position = "absolute";
        slp.Frame.style.zIndex = "2";
        slp.Frame.style.height = "calc(" + (this._dispFrameCount > 1 ? "50%" : "100%") + " - 8px)";
        slp.Frame.style.width = "calc(" + (this._dispFrameCount > 2 ? "50%" : "100%") + " - 8px)";

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
    }

}