
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import UserSettingsController from "./UserSettingsController";
import SettingController from "./Setting/SettingController";


export default class UserSettingsView extends AbstractServiceView<UserSettingsController> {

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {
        StdUtil.StopPropagation();
        let element = document.getElementById('sbj-main');
        new SettingController(this.Controller, element);

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
