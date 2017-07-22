import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import RoomController from "./RoomController";

if (StdUtil.IsExecute()) {

    let hid = LinkUtil.GetArgs('hid');
    let controller = new RoomController(hid);
}