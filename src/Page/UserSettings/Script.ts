
import StdUtil from "../../Base/Util/StdUtil";
import UserSettingsController from "./UserSettingsController";

if (StdUtil.IsSupoortPlatform()) {
    let controller = new UserSettingsController();
}
