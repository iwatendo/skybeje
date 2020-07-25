
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import VoiceChatSettingsController from "./VoiceChatSettingsController";
import LocalCache from "../../Contents/Cache/LocalCache";
import DeviceUtil, { DeviceKind } from "../../Base/Util/DeviceUtil";
import { DeviceView } from "../DeviceView/DeviceVew";


export default class VoiceChatSettingsView extends AbstractServiceView<VoiceChatSettingsController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {
        StdUtil.StopPropagation();
        let element = document.getElementById('sbj-main');

        document.getElementById('sbj-setting-close').onclick = (e) => { this.Close(); }
        document.getElementById('sbj-voicechat-settings-close').onclick = (e) => { this.Close(); }

        //  ESCキーでも閉じる
        document.onkeydown = (e: KeyboardEvent) => { this.Close(); }

        this.SetMediaDevice();
        document.getElementById("mic-select-div").classList.add("is-dirty");

        callback();
    }


    /**
     * タブ毎閉じる
     */
    public Close() {
        this.Controller.PageClose();
    }


    /**
     * Audioソースの取得とリストへのセット
     */
    public SetMediaDevice() {

        let preMic = LocalCache.VoiceChatOptions.SelectMic;
        let isInit = (!preMic);

        DeviceUtil.GetAudioDevice((devices) => {

            let textElement = document.getElementById('mic-select') as HTMLInputElement;
            var listElement = document.getElementById('mic-list') as HTMLElement;

            var view = new DeviceView(DeviceKind.Audio, textElement, listElement, devices, (deviceId, deviceName) => {
                LocalCache.SetVoiceChatOptions((opt) => opt.SelectMic = deviceId);
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preMic);
            }

            document.getElementById("mic-select-div").classList.add("is-dirty");
        });

    }

}
