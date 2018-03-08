import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import RoomController from "./RoomController";

if (StdUtil.IsSupoortPlatform()) {

    let hid = LinkUtil.GetArgs('hid');
    let controller = new RoomController(hid);
}