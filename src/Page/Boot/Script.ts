import DBContainer from "../../Base/IndexedDB/DBContainer";
import LocalCache from "../../Base/Common/LocalCache";
import LinkUtil from "../../Base/Util/LinkUtil";

if (!LocalCache.InitializedSkybeje) {
    let dbc = new DBContainer();
    dbc.RemoveAll(() => {
    });
}
else {
    let id = LinkUtil.GetPeerID();
    if (id) {
        window.location.href = LinkUtil.CreateLink("dashboard/", id);
    }
}
