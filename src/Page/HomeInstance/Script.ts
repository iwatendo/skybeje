import StdUtil from "../../Base/Util/StdUtil";
import SWPeer from "../../Base/WebRTC/SWPeer";
import LocalCache from "../../Contents/Cache/LocalCache";
import HomeInstanceController from "./HomeInstanceController";

if (StdUtil.IsSupoortPlatform()) {

    let bootid = LocalCache.BootHomeInstancePeerID;

    if (bootid && bootid.length > 0) {

        //  instanceIDが設定されていた場合は多重起動と判定する
        document.getElementById('sbj-home-instance-header').hidden = true;
        document.getElementById('sbj-home-instance-main').hidden = true;
        document.getElementById('sbj-home-instance-mulitboot-error').hidden = false;

        //  強制起動
        document.getElementById('sbj-home-instance-force-boot').onclick = () => {
            LocalCache.BootHomeInstancePeerID = "";
            location.reload();
        }
    }
    else {
        //  通常起動
        let server = new HomeInstanceController();
        server.SwPeer = new SWPeer(server, null, null);
    }
}


