
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import ProfileController from "./ProfileController";


export default class ProfileView extends AbstractServiceView<ProfileController> {

    /**
     * 初期化処理
     */
    public Initialize(callback: OnViewLoad) {
        callback();
    }

}
