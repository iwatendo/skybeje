import DBContainer from "../../Base/IndexedDB/DBContainer";
import LocalCache from "../../Base/Common/LocalCache";

if (!LocalCache.InitializedSkybeje) {
    let dbc = new DBContainer();
    dbc.RemoveAll(() => {
    });
}