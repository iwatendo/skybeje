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


    /**
     * オーナーPeerの接続時イベント
     */
    public OnOwnerConnection() {
        if (this.View) {
            this.View.SendVoiceChatInfo();
        }
    }


    /*-----------------------------------------------------------
     * ボイスチャット用
     *----------------------------------------------------------*/

    /**
     * 
     */
    public OnRoomOpen() {
        this.View.JoinButtonDisabled = false;
    }


    /**
     * 
     */
    public OnRoomClose() {
        this.View.JoinButtonDisabled = false;
    }


    private _peerList = new Array<string>();
    private _map = new Map<string, MediaStreamTrack>();

    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: MediaStream) {

        if (stream && peerid !== this.SwPeer.PeerId) {

            let track = this.View.AddAudioTrack(stream);
            this.View.RefreshAudio();

            if (track) {
                this._map.set(peerid, track);
            }

            //  新しいStreamが追加された場合通知
            if (this._peerList.filter((p) => p === peerid).length === 0) {
                this._peerList.push(peerid);
                this.View.ChangeVoiceChatStreamMember(this._peerList);
            }
        }
    }


    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomRemoveStream(peerid: string, stream: any) {

        if (this._map.has(peerid)) {
            let track = this._map.get(peerid);
            this.View.RemoveAudioTrack(track);
        }

        //  Streamが除去された場合通知
        if (this._peerList.filter((p) => p === peerid).length === 0) {
            this._peerList = this._peerList.filter((p) => p !== peerid);
            this.View.ChangeVoiceChatStreamMember(this._peerList);
        }
    }

};
