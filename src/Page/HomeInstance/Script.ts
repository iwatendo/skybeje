
import * as Home from "../../Contents/IndexedDB/Home";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeInstanceController from "./HomeInstanceController";
import HomeInstanceReceiver from "./HomeInstanceReceiver";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";

if (StdUtil.IsExecute()) {

    let db = new Home.DB();

    db.Connect(() => {
        let server = new HomeInstanceController();
        server.SwPeer = new SWPeer(server, null, null);

        //  前回起動時に正常終了している場合、以下の値は空になる為、通常は設定されない
        //  オーナー接続できた場合、多重起動された状態なので強制終了の通知を出す
        let ownerID = LocalCache.BootHomeInstancePeerID;
    });

}
