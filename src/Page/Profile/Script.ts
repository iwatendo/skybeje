import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import ProfileController from "./ProfileController";

if (StdUtil.IsExecute()) {

    let aid = LinkUtil.GetArgs('aid');
    let ownerAid = LinkUtil.GetArgs('owner_aid');
    let controller = new ProfileController(aid, ownerAid);
}