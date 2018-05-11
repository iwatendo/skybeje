
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import UserSettingsController from "./UserSettingsController";
import SettingController from "./Setting/SettingController";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import SettingsChangeSender from "../../Contents/Sender/SettingsChangeSender";


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
            this.Close();
        }

        //  ESCキーでのクローズ
        document.onkeydown = (e) => {
            if (e.keyCode === 27) {
                this.Close();
            }
        }

        MessageChannelUtil.SetChild(this.Controller, () => { });

        window.addEventListener('beforeunload', (e) => {
            //  メッセージチャンネルを使って終了通知をする
            let sender = new SettingsChangeSender();
            sender.isClose = true;
            MessageChannelUtil.PostOwner(sender);
        }, false);

        callback();
    }

    public Close() {
        this.Controller.PageClose();
    }


    /**
     * サーバントの起動有無
     */
    public IsBootServent(): boolean {
        //  対策を検討する
        return false;
    }

}
