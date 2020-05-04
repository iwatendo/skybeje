import AbstractServiceController from "../../Base/AbstractServiceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import { CastVisitorView } from "./CastVisitorView";
import CastVisitorModel from "./CastVisitorModel";
import { CastVisitorReceiver } from "./CastVisitorReceiver";
import LinkUtil from "../../Base/Util/LinkUtil";
import SWRoom, { SWRoomMode } from "../../Base/WebRTC/SWRoom";
import StreamUtil from "../../Base/Util/StreamUtil";


export default class CastVisitorController extends AbstractServiceController<CastVisitorView, CastVisitorModel> {

    public ControllerName(): string { return "CastVisitor"; }

    public View: CastVisitorView;

    private _castPeerId: string;

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.Receiver = new CastVisitorReceiver(this);
    };


    /**
     * 自身のPeer生成時イベント
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        this.View = new CastVisitorView(this, () => {
            //  
        });
    }

    public OnPeerClose() {
        MessageChannelUtil.RemoveChild(this.SwPeer.PeerId);
    }


    //  Peerエラー
    public OnPeerError(err: Error) {
        document.getElementById('sbj-cast-visitor-message-port').hidden = false;
        document.getElementById('sbj-cast-visitor-message').textContent = "接続に失敗、またはプライベート配信は終了しています";
    }


    /**
     * オーナー接続時イベント
     */
    public OnOwnerConnection() {

        //  キャスト情報の要求
        this.SwPeer.SendToOwner(new GetCastSettingSedner());

        //  カーソル表示の初期化はOwnerとの接続後に開始する。
        this.View.InitializeCursor();
    }


    /**
     * 
     * @param conn 
     */
    public OnDataConnectionOpen(conn: PeerJs.DataConnection) {
        super.OnDataConnectionOpen(conn);
    }


    /**
     * 
     * @param conn 
     */
    public OnDataConnectionClose(conn: PeerJs.DataConnection) {
        super.OnDataConnectionClose(conn);
        this.View.Cursor.Remove(conn.remoteId);
    }


    /**
     * スリープ関数
     * @param milliseconds 
     */
    private Sleep(milliseconds: number) {
        return new Promise<void>(resolve => { setTimeout(() => resolve(), milliseconds); });
    }


    /**
     *【削除予定】
     * 受信モードでRoomに接続すると、SFUのストリームが流れて来ないケースが発生
     * PeerJoin / PeerLeave が発生すると streamが流れてくる来るようなので、SkyWay側での対応されるまでの暫定対応
     */
    public DummyJoin() {
        SWPeer.GetApiKey((apikey) => {
            let peer = new Peer({ key: apikey, debug: 1 }) as any;
            peer.on('open', async () => {
                await this.Sleep(1000);
                let name = this.SwRoom.RoomName;
                let room = peer.joinRoom(name, { mode: "sfu" });
                room.on('open', async () => {
                    await this.Sleep(2000);
                    peer.destroy();
                });
            });
        });
    }


    public JoinRoom() {
        if (!this.SwRoom) {
            let roomMode = (this.UseSFU() ? SWRoomMode.SFU : SWRoomMode.Mesh);
            this.SwRoom = new SWRoom(this, LinkUtil.GetPeerID(), roomMode);
        }
    }


    /** 
     * 
     */
    public UseSFU(): boolean {
        let arg = LinkUtil.GetArgs('sfu');
        if (arg === "1") return true;
        if (arg === "0") return false;
        //  オプション未指定時はSFU使用と判定する
        return true;
    }


    /**
     * 
     */
    public OnRoomOpen() {
        if (this.UseSFU()) {
            this.DummyJoin();
        }
    }



    /**
     * 
     * @param peerid 
     * @param stream 
     */
    public OnRoomStream(peerid: string, stream: MediaStream) {

        let element = document.getElementById('sbj-video') as HTMLVideoElement;

        if (element) {
            this._castPeerId = peerid;
            element.hidden = false;
            element.srcObject = stream;
            element.oncanplay = (e) => {
                if (!StreamUtil.HasAudioStream(stream)) {
                    this.View.VolumeHide();
                }
                this.View.MessageHide();
                element.play();
                this.View.Cursor.DisplayAll();
            }
        }
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerLeave(peerid: string) {

        if (peerid == this._castPeerId) {
            document.getElementById('sbj-cast-visitor-message-port').hidden = false;
            document.getElementById('sbj-cast-visitor-message').textContent = "プライベート配信は終了しました";
            this.PageClose();
        }
    }

};
