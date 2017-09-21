import * as React from 'react';
import * as ReactDOM from 'react-dom';

import DeviceUtil from "../../../Base/Util/DeviceUtil";

import CastInstanceController from "../CastInstanceController";
import DeviceComponent from "./DeviceComponent";


export interface OnChangeDevice { (deviceId: string, deviceName: string): void };


export class DeviceView {

    private _controller: CastInstanceController;
    private _textElement: HTMLInputElement;
    private _listElement: HTMLElement;
    private _devices: Array<any>;
    private _onChangeDevice: OnChangeDevice;
    private _selectDeviceId: string;


    /**
     * 
     */
    public get Controller(): CastInstanceController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param textElement 
     * @param listElement 
     * @param devices 
     * @param deviceSelector 
     */
    public constructor(controller: CastInstanceController, textElement: HTMLInputElement, listElement: HTMLElement, devices: Array<string>, deviceSelector: OnChangeDevice) {
        this._controller = controller;
        this._textElement = textElement;
        this._listElement = listElement;
        this._devices = devices;
        this._onChangeDevice = deviceSelector;
        this.Create();
    }


    /**
     * 生成処理（描画処理）
     */
    public Create() {
        ReactDOM.render(<DeviceComponent owner={this} deviceList={this._devices} />, this._listElement, () => { });
    }


    /**
     * 選択デバイスの変更
     * @param deviceId 
     * @param deviceName 
     */
    public ChangeDevice(deviceId: string, deviceName: string) {

        //  リストを非表示にする為のクリックアクション
        this._textElement.click();

        this._selectDeviceId = deviceId;
        this._textElement.value = deviceName;
        if (this._onChangeDevice) {
            this._onChangeDevice(deviceId, deviceName);
        }
    }


    /**
     * 
     */
    public SelectClear() {
        this._selectDeviceId = "";
        this._textElement.value = "";
        if (this._onChangeDevice) {
            this._onChangeDevice("", "");
        }
    }


    /**
     * 先頭のデバイスを選択状態にする
     */
    public SelectFirstDevice() {
        if (this._devices && this._devices.length > 0) {
            this.SelectDeivce(this._devices[0].label);
        }
    }


    /**
     * 指定したデバイスを選択状態にする　
     * @param deviceName 
     */
    public SelectDeivce(deviceName: string) {
        this._textElement.value = deviceName;
        let id = DeviceUtil.GetDeviceId(deviceName);
        if (this._onChangeDevice) {
            this._onChangeDevice(id, deviceName);
        }
    }
}
