
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import UserSettingsController from "./UserSettingsController";
import SettingController from "./Setting/SettingController";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import SettingsChangeInfo from "../../Contents/Struct/SettingsChangeInfo";


export default class UserSettingsView extends AbstractServiceView<UserSettingsController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {
        StdUtil.StopPropagation();
        let element = document.getElementById('sbj-main');
        new SettingController(this.Controller, element);

        document.getElementById('sbj-setting-close').onclick = (e) => {
            window.open('about:blank', '_self').close();
        }

        MessageChannelUtil.SetChild(this.Controller, () => { });

        window.addEventListener('beforeunload', (e) => {
            //  メッセージチャンネルを使って終了通知をする
            let info = new SettingsChangeInfo();
            info.isClose = true;
            MessageChannelUtil.PostOwner(JSON.stringify(info));
        }, false);

        callback();
    }


    /**
     * サーバントの起動有無
     */
    public IsBootServent(): boolean {
        //  対策を検討する
        return false;
    }

}
