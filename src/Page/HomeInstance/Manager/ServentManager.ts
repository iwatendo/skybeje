
import WebRTCService from "../../../Base/Common/WebRTCService";

import * as HIContainer from "../HomeInstanceContainer";
import HomeInstanceController from "../HomeInstanceController";
import RoomManager from "./RoomManager";

export default class ServentManager {

    private _controller: HomeInstanceController;
    private _roomManager: RoomManager;
    private _peerServentMap = new Map<string, Array<HIContainer.ServentSender>>();    /* MAP : PeerID / Array<ServentSender> */


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
     * @param servent 
     */
    public SetServent(servent: HIContainer.ServentSender) {

        let peerid = servent.ownerPeerid;

        if (!this._peerServentMap.has(peerid)) {
            this._peerServentMap.set(peerid, new Array<HIContainer.ServentSender>());
        }

        let preList = this._peerServentMap.get(servent.ownerPeerid);
        let newList = preList.filter((pre) => pre.serventPeerId !== servent.serventPeerId);
        newList.push(servent);

        this._peerServentMap.set(peerid, newList);

        this.SendServent(servent.hid);
    }


    /**
     * サーバントの終了通知
     * @param servent 
     */
    public CloseServent(servent: HIContainer.ServentCloseSender) {

        let peerid = servent.ownerPeerid;

        if (!this._peerServentMap.has(peerid)) {
            return;
        }

        let preList = this._peerServentMap.get(servent.ownerPeerid);
        let newList = new Array<HIContainer.ServentSender>();
        let removeServent: HIContainer.ServentSender = null;

        this._peerServentMap.get(servent.ownerPeerid).forEach(pre => {
            if (pre.serventPeerId === servent.serventPeerId) {
                removeServent = pre;
            }
            else {
                newList.push(pre);
            }
        });

        if (removeServent !== null) {
            this._peerServentMap.set(peerid, newList);
            this.SendServent(removeServent.hid);
        }

    }


    /**
     * サーバントの親サーバーントが終了した場合、
     * その親が保持していた子サーバントを全て削除
     * @param ownerPeerId 
     */
    public CloseServentOwner(peerid: string) {

        if (!this._peerServentMap.has(peerid)) {
            return;
        }

        let preList = this._peerServentMap.get(peerid);

        if (preList.length === 0) {
            return;
        }

        this._peerServentMap.set(peerid, new Array<HIContainer.ServentSender>());

        preList.forEach(pre => {
            this.SendServent(pre.hid);
        });

    }


    /**
     * 同一ルーム内の各Visitorに通知
     * @param tlmsg 
     */
    private SendServent(hid: string) {

        this._roomManager.GetRoomInPeers(hid).forEach((peerid) => {

            let sender = this.GetServent(hid);
            WebRTCService.SendTo(peerid, sender);
        });
    }


    /**
     * 指定した部屋のサーバント一覧を取得
     * @param hid 
     */
    public GetServent(hid: string): HIContainer.RoomServentSender {

        let result = new HIContainer.RoomServentSender();
        result.hid = hid;

        this._peerServentMap.forEach((sslist, peerid) => {
            sslist.forEach((ss) => {
                if (ss.hid === hid && ss.isCasting) {
                    result.servents.push(ss);
                }
            });
        });

        return result;
    }

}