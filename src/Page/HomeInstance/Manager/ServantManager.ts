
import WebRTCService from "../../../Base/Common/WebRTCService";

import * as HIContainer from "../HomeInstanceContainer";
import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";

export default class ServantManager {

    private _controller: HomeInstanceController;
    private _roomManager: RoomManager;
    private _peerServantMap = new Map<string, Array<HIContainer.ServantSender>>();    /* MAP : PeerID / Array<ServantSender> */


    public get Controller(): HomeInstanceController {
        return this._controller;
    }


    /**
     * コンストラクタ
     * @param controller 
     * @param roomManager 
     */
    constructor(controller: HomeInstanceController, roomManager: RoomManager) {
        this._controller = controller;
        this._roomManager = roomManager;
    }


    /**
     * サーバントの起動/変更通知
     * @param servant 
     */
    public SetServant(servant: HIContainer.ServantSender) {

        let peerid = servant.ownerPeerid;

        if (!this._peerServantMap.has(peerid)) {
            this._peerServantMap.set(peerid, new Array<HIContainer.ServantSender>());
        }

        let preList = this._peerServantMap.get(servant.ownerPeerid);
        let newList = preList.filter((pre) => pre.servantPeerId !== servant.servantPeerId);
        newList.push(servant);

        this._peerServantMap.set(peerid, newList);

        this.SendServant(servant.hid);
    }


    /**
     * サーバントの終了通知
     * @param servant 
     */
    public CloseServant(servant: HIContainer.ServantCloseSender) {

        let peerid = servant.ownerPeerid;

        if (!this._peerServantMap.has(peerid)) {
            return;
        }

        let preList = this._peerServantMap.get(servant.ownerPeerid);
        let newList = new Array<HIContainer.ServantSender>();
        let removeServant: HIContainer.ServantSender = null;

        this._peerServantMap.get(servant.ownerPeerid).forEach(pre => {
            if (pre.servantPeerId === servant.servantPeerId) {
                removeServant = pre;
            }
            else {
                newList.push(pre);
            }
        });

        if (removeServant !== null) {
            this._peerServantMap.set(peerid, newList);
            this.SendServant(removeServant.hid);
        }

    }


    /**
     * サーバントの親サーバーントが終了した場合、
     * その親が保持していた子サーバントを全て削除
     * @param ownerPeerId 
     */
    public CloseServantOwner(peerid: string) {

        if (!this._peerServantMap.has(peerid)) {
            return;
        }

        let preList = this._peerServantMap.get(peerid);

        if (preList.length === 0) {
            return;
        }

        this._peerServantMap.set(peerid, new Array<HIContainer.ServantSender>());

        preList.forEach(pre => {
            this.SendServant(pre.hid);
        });

    }


    /**
     * 同一ルーム内の各Visitorに通知
     * @param tlmsg 
     */
    private SendServant(hid: string) {

        this._roomManager.GetRoomInPeers(hid).forEach((peerid) => {

            this._controller.ConnCache.GetExec(peerid, (conn) => {
                if (conn && conn.open) {
                    let sender = this.GetServant(hid);
                    WebRTCService.ChildSend(conn, sender);
                }
            });
        });
    }


    /**
     * 指定した部屋のサーバント一覧を取得
     * @param hid 
     */
    public GetServant(hid: string): HIContainer.RoomServantSender {

        let result = new HIContainer.RoomServantSender();
        result.hid = hid;

        this._peerServantMap.forEach((sslist, peerid) => {
            sslist.forEach((ss) => {
                if (ss.hid === hid && ss.isStreaming) {
                    result.servants.push(ss);
                }
            });
        });

        return result;
    }

}