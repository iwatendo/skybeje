
import HomeVisitorController from "../HomeVisitorController";
import CastInstanceSender from "../../../Base/Container/CastInstanceSender";
import { ServantSender, RoomServantSender } from "../../HomeInstance/HomeInstanceContainer";

interface OnGetServantSender { (sender: ServantSender): void }
interface OnGetRoomServantSender { (sender: RoomServantSender): void }

export default class ServantCache {

    //
    private _controller: HomeVisitorController;
    //  servantPid / ServantSender
    private _myServantCache = new Map<string, ServantSender>();
    //  hid / RoomServantSender
    private _roomServantCache = new Map<string, RoomServantSender>();

    /**
     * コンストラクタ
     * @param controller 
     */
    public constructor(controller: HomeVisitorController) {
        this._controller = controller;
    }

    /**
     * 
     * @param servantPid 
     * @param cib 
     * @param callback 
     */
    public GetMyServant(servantPid: string, cib: CastInstanceSender, callback: OnGetServantSender) {

        let cache = this._myServantCache;

        if (cache.has(servantPid)) {
            let servant = cache.get(servantPid);
            servant.isCasting = cib.isCasting;
            callback(servant);
        }
        else {

            let selectAid = this._controller.CurrentAid;

            this._controller.Model.GetUserProfile((profile) => {

                this._controller.RoomCache.GetRoomByActorId(selectAid, (room) => {
                    let servant = new ServantSender();
                    servant.servantPeerId = servantPid;
                    servant.ownerPeerid = this._controller.PeerId;
                    servant.ownerAid = profile.aid;
                    servant.ownerIid = profile.dispIid;
                    servant.hid = room.hid;
                    servant.clientUrl = cib.clientUrl;
                    servant.castType = cib.castType;
                    servant.instanceUrl = cib.instanceUrl;
                    servant.isCasting = cib.isCasting;
                    callback(servant);

                    cache.set(servantPid, servant);
                });
            });
        }
    }


    /**
     * 
     * @param servant 
     */
    public SetRoomServant(servant: RoomServantSender) {

        //  
        this._roomServantCache.set(servant.hid, servant);

    }


    /**
     * 
     * @param hid 
     */
    public GetRoomServant(hid: string, callback: OnGetRoomServantSender) {

        let result: RoomServantSender;

        //
        if (this._roomServantCache.has(hid)) {
            result = this._roomServantCache.get(hid);
        }
        else {
            result = new RoomServantSender();
        }

        callback(result);
    }

}