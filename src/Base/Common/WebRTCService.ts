import { IServiceController } from "./IServiceController";
import LogUtil from "../Util/LogUtil";
import Sender from "../Container/Sender";
import LocalCache from "./LocalCache";
import StdUtil from "../Util/StdUtil";
import SWPeer from "./Connect/SWPeer";
import SWStream from "./Connect/SWStream";
import SWRoom from "./Connect/SWRoom";
import SWStreamListener from "./Connect/SWStreamListener";


interface OnGetMediaStream { (stream: MediaStream): void }

declare var SkyWay: any;

export default class WebRTCService {

    private static _peer: SWPeer;
    private static _stream: SWStream;
    private static _streamListener: SWStreamListener;

    /**
     * WebRTCServiceの起動
     * @param service
     * @param ownerid
     * @param name
     */
    public static Start(service: IServiceController, ownerid: string, serviceName: string, videoElement: HTMLVideoElement = null) {

        Sender.Uid = LocalCache.UserID;

        this._peer = new SWPeer(service, ownerid, (swp) => {
            //  受信用ストリーム設定
            if (videoElement) {
                this._streamListener = new SWStreamListener(service, swp, ownerid,videoElement);
            }
        });

        //  配信用ストリーム設定
        this._peer.SWStream = new SWStream(service, this._peer);
        this._stream = this._peer.SWStream;

    }


    //  SWPeer Wrapper
    public static PeerId(): string { return (this._peer ? this._peer.PeerId : ""); }
    public static GetAliveConnectionCount(): number { return this._peer.GetAliveConnectionCount(); }
    public static Close() { this._peer.Close(); }
    public static SendToOwner(data: Sender) { this._peer.SendToOwner(data); }
    public static SendTo(peer: string | PeerJs.DataConnection, data: Sender) { this._peer.SendTo(peer, data); }
    public static SendAll(data: Sender) { this._peer.SendAll(data); }

    //  SWStream Wrapper
    public static SetPreview(element: HTMLVideoElement, videoSource: string) { this._stream.SetPreview(element, videoSource); }
    public static StartPreview(element: HTMLVideoElement, stream: MediaStream) { this._stream.StartPreview(element, stream); }
    public static StopPreview(element: HTMLVideoElement) { this._stream.StopPreview(element); }
    public static GetMediaStream(videoSource: string, audioSource: string, callback: OnGetMediaStream) { this._stream.GetMediaStream(videoSource, audioSource, callback); }
    public static IsEnabledExtension(): boolean { return this._stream.IsEnabledExtension(); }
    public static GetScreenShareMediaStream(width: number, height: number, fr: number, callback: OnGetMediaStream) { this._stream.GetScreenShareMediaStream(width, height, fr, callback); }
    public static SetStreaming(audioSource: string, videoSource: string) { this._stream.SetStreaming(audioSource, videoSource); }
    public static SetScreenSheare(width: number, height: number, fr: number, callback) { this._stream.SetScreenSheare(width, height, fr, callback); }

}