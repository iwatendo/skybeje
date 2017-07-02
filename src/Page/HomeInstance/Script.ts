
import * as Home from "../../Base/IndexedDB/Home";

import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";

import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeInstanceController from "./HomeInstanceController";
import HomeInstanceReceiver from "./HomeInstanceReceiver";

if (StdUtil.IsExecute()) {

    let db = new Home.DB();

    db.Connect(() => {
        let server = new HomeInstanceController();

        //  前回起動時に正常終了している場合、以下の値は空になる為、通常は設定されない
        //  オーナー接続できた場合、多重起動された状態なので強制終了の通知を出す
        let ownerID = LocalCache.BootHomeInstancePeerID;

        WebRTCService.Start(server, ownerID, "HomeInstance");
    });

}
