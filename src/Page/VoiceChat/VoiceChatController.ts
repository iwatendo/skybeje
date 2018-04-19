import AbstractServiceController from "../../Base/AbstractServiceController";
import LogUtil from "../../Base/Util/LogUtil";

import VoiceChatReceiver from "./VoiceChatReceiver";
import VoiceChatView from "./VoiceChatView";
import VoiceChatModel from "./VoiceChatModel";
import SWPeer from "../../Base/WebRTC/SWPeer";
import { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import StdUtil from "../../Base/Util/StdUtil";

/**
 * 
 */
export default class VoiceChatController extends AbstractServiceController<VoiceChatView, VoiceChatModel> {


    public ControllerName(): string { return "VoiceChat"; }


    /**
     *
     */
    constructor() {
        super();
    };


    /**
     * 自身のPeer生成時イベント
     * ※サーバー用のPeerID取得時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {
        this.Receiver = new VoiceChatReceiver(this);
        this.Model = new VoiceChatModel(this, () => { });
        this.View = new VoiceChatView(this, () => { });
    }


    /**
     * 
     * @param err
     */
    public OnPeerError(err: Error) {

        if ((err as any).type === "peer-unavailable") {
            LogUtil.Warning(this, err.message);
            let peerid = err.message.replace("Could not connect to peer ", "").replace("'", "");
        }
        else {
            LogUtil.Error(this, 'peer error');
            LogUtil.Error(this, err.message);
            LogUtil.FatalError(err.message);
        }
    }


    /*-----------------------------------------------------------
     * ボイスチャット用
     *----------------------------------------------------------*/

    private _elementMap = new Map<string, HTMLVideoElement>();
    private _peerList = new Array<string>();


    /**
     * 
     * @param peerid 
     * @param videoElement 
     */
    public SetVideoElement(peerid: string, videoElement: HTMLVideoElement) {
        if (this._elementMap.has(peerid)) {
            let preElement = this._elementMap.get(peerid);
        }
        else {
            this._elementMap.set(peerid, videoElement);
        }
    }


    /**
     * 
     * @param peerid 
     */
    public GetVideoElement(peerid): HTMLVideoElement {

        if (this._elementMap.has(peerid)) {
            return this._elementMap.get(peerid);
        }
        else {
            let newElement: HTMLVideoElement = document.createElement('video');

            newElement.id = peerid;
            this._elementMap.set(peerid, newElement);
            return newElement;
        }

    }


    /**
     * スリープ関数
     * @param milliseconds 
     */
    private Sleep(milliseconds: number) {
        return new Promise<void>(resolve => { setTimeout(() => resolve(), milliseconds); });
    }


    /**
     * 
     */
    public OnRoomOpen() {

        this.View.JoinButtonDisabled = false;

        // /**
        //  *【削除予定】
        // * 受信モードでRoomに接続すると、SFUのストリームが流れて来ないケースが発生
        // * PeerJoin / PeerLeave が発生すると streamが流れてくる来るようなので、SkyWay側での対応されるまでの暫定対応
        // */
        // let roomMode = (this.SwRoom.RoomMode === SWRoomMode.SFU ? "sfu" : "mesh");

        // SWPeer.GetApiKey((apikey) => {
        //     let peer = new Peer({ key: apikey, debug: 1 }) as any;
        //     peer.on('open', async () => {
        //         await this.Sleep(1000);
        //         let name = this.SwRoom.RoomName;
        //         let room = peer.joinRoom(name, { mode: roomMode });
        //         room.on('open', async () => {
        //             await this.Sleep(2000);
        //             peer.destroy();
        //         });
        //     });
        // });

    }


    public OnRoomClose() {
        this.View.JoinButtonDisabled = false;
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: any) {

        let element = this.GetVideoElement(peerid);

        if (element) {
            element.srcObject = stream;
            element.play();
        }

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            //  新しい通話Streamが追加された場合、通知する
            this._peerList.push(peerid);
            this.View.ChangeVoiceChatStreamMember(this._peerList);
        }
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {
        let element = this.GetVideoElement(peerid);

        if (element) {
            element.pause();
        }

        if (this._peerList.filter((p) => p === peerid).length === 0) {
            //  通話Streamが除去された場合、通知する
            this._peerList = this._peerList.filter((p) => p !== peerid);
            this.View.ChangeVoiceChatStreamMember(this._peerList);
        }
    }

};
