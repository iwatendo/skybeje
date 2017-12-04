import SWPeer from "../../../Base/WebRTC/SWPeer";
import { SWRoomMode } from "../../../Base/WebRTC/SWRoom";
import SWRoomController from "../../../Base/WebRTC/SWRoomController";


interface OnChangePeerList { (peerList: Array<string>): void }


export default class VoiceSfuRoomController extends SWRoomController {


    private _onChangePeerList: OnChangePeerList;
    private _peerList = new Array<string>();

    /**
     * コンストラクタ
     * @param swPeer 
     * @param roomName 
     * @param mode 
     * @param stream 
     */
    constructor(swPeer: SWPeer, roomName: string, mode: SWRoomMode, stream: any = null, callback: OnChangePeerList) {
        super(swPeer, roomName, mode, stream);
        this._onChangePeerList = callback;
    }


    /**
     * ストリーム接続時イベント
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: any) {
        super.OnRoomStream(peerid, stream);

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            //  新しい通話Streamが追加された場合、通知する
            this._peerList.push(peerid);
            this._onChangePeerList(this._peerList);
        }
    }


    /**
     * ストリーム切断時イベント
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {
        super.OnRoomRemoveStream(peerid, stream);

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            //  通話Streamが除去された場合、通知する
            this._peerList = this._peerList.filter((p) => p !== peerid);
            this._onChangePeerList(this._peerList);
        }
    }

}