
import StdUtil from "../../Base/Util/StdUtil";
import VoiceChatSettingsController from "./VoiceChatSettingsController";

if (StdUtil.IsSupoortPlatform(true)) {
    let controller = new VoiceChatSettingsController();
}
