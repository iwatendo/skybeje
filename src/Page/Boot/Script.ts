import DBContainer from "../../Contents/IndexedDB/DBContainer";
import LinkUtil from "../../Base/Util/LinkUtil";
import LocalCache from "../../Contents/Cache/LocalCache";

if (!LocalCache.InitializedSkybeje) {
    let dbc = new DBContainer();
    dbc.RemoveAll(() => {
        LocalCache.InitializedSkybeje = true;
    });
}
else {
    let id = LinkUtil.GetPeerID();
    if (id) {
        window.location.href = LinkUtil.CreateLink("dashboard/", id);
    }
}
