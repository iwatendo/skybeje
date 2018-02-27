
import StdUtil from "../../Base/Util/StdUtil";
import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import SelectActorController from "./SelectActorController";
import ProfileView from "./Profile/ProfileView";


export default class SelectActorView extends AbstractServiceView<SelectActorController> {

    public ProfileView : ProfileView;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {
        StdUtil.StopPropagation();
        let element = document.getElementById('sbj-main');
        this.ProfileView = new ProfileView(this.Controller, element);

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
