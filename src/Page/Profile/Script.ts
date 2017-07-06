import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import ProfileController from "./ProfileController";

if (StdUtil.IsExecute()) {

    let aid = Number.parseInt(LinkUtil.GetArgs('aid'));
    let controller = new ProfileController(aid);
}