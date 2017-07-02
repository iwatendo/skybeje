
import HomeVisitorController from "../HomeVisitorController";
import { CastInstanceSender } from "../../CastInstance/CastInstanceContainer";
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
            servant.isStreaming = cib.setting.isStreaming;
            callback(servant);
        }
        else {

            let selectAid = this._controller.UseActor.CurrentAid;

            this._controller.Model.GetUserProfile((profile) => {

                let profileAid = profile.aid;
                let profileIid = (profile.iconIds.length > 0 ? profile.iconIds[0] : "");

                this._controller.RoomCache.GetRoomByActorId(selectAid, (room) => {
                    let servant = new ServantSender();
                    servant.servantPeerId = servantPid;
                    servant.ownerPeerid = this._controller.PeerId;
                    servant.ownerAid = profileAid;
                    servant.ownerIid = profileIid;
                    servant.hid = room.hid;
                    servant.clientUrl = cib.clientUrl;
                    servant.instanceUrl = cib.instanceUrl;
                    servant.isStreaming = cib.setting.isStreaming;
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
        if(this._roomServantCache.has(hid)){
            result = this._roomServantCache.get(hid);
        }
        else{
            result = new RoomServantSender();
        }

        callback(result);
    }

}