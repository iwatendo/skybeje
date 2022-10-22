import { ThreeSixty } from '@mui/icons-material';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import CameraResolutionComponent from "./CameraResolutionComponent";


export interface OnChangeCameraResolution { (msc: MediaStreamConstraints, dispName: string): void };


export class CameraResolutionView {

    private _textElement: HTMLInputElement;
    private _listElement: HTMLElement;
    private _mscList: Array<MediaStreamConstraints>;
    private _onChangeCameraResolution: OnChangeCameraResolution;
    private _selectMsc: MediaStreamConstraints;
    private _msc: MediaStreamConstraints;

    /**
     * コンストラクタ
     * @param msc
     * @param textElement 
     * @param listElement 
     * @param mscList 
     * @param resolutionSelector 
     */
    public constructor(msc: MediaStreamConstraints, textElement: HTMLInputElement, listElement: HTMLElement, mscList: Array<MediaStreamConstraints>, resolutionSelector: OnChangeCameraResolution) {
        this._msc = msc;
        this._textElement = textElement;
        this._textElement.style.cursor = "pointer";
        this._listElement = listElement;
        this._mscList = mscList;
        this._onChangeCameraResolution = resolutionSelector;
        this.Create();

        if(!msc){
            this.SelectClear();
        }
    }


    /**
     * 生成処理（描画処理）
     */
    public Create() {
        ReactDOM.render(<CameraResolutionComponent owner={this} mscList={this._mscList} />, this._listElement, () => { });
    }


    /**
     * 選択デバイスの変更
     * @param deviceId 
     * @param deviceName 
     */
    public ChangeCameraResolution(mscJsonStr: string, dispName: string) {

        //  リストを非表示にする為のクリックアクション
        this._textElement.click();

        this._selectMsc = (mscJsonStr ? JSON.parse(mscJsonStr) : null);
        this._textElement.value = dispName;
        if (this._onChangeCameraResolution) {
            this._onChangeCameraResolution(this._selectMsc, dispName);
        }
    }


    /**
     * 
     */
    public SelectClear() {
        this._selectMsc = null;
        this._textElement.value = "";
        if (this._onChangeCameraResolution) {
            this._onChangeCameraResolution(null, "");
        }
    }


    /**
     * 先頭のデバイスを選択状態にする
     */
    public SelectLastCameraResolution() {
        if (this._mscList && this._mscList.length > 0) {
            this.SelectDeivce(this._mscList[this._mscList.length - 1]);
        }
    }


    /**
     * 表示用ラベル
     * @param msc 
     * @returns 
     */
    public ToDispLabel(msc: MediaStreamConstraints) {

        if (msc == null) {
            return "";
        }
        else {
            let size = ((msc) as any).video.advanced[0];
            let width = size.width;
            let height = size.height;
            return `${width}x${height}`;
        }
    }


    /**
     * 指定したデバイスを選択状態にする　
     * @param id 
     */
    public SelectDeivce(msc: MediaStreamConstraints) {

        let dispName = this.ToDispLabel(msc);
        this._textElement.value = dispName;

        if (this._onChangeCameraResolution) {
            this._onChangeCameraResolution(msc, dispName);
        }

    }



}
