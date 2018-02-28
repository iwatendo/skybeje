import AbstractServiceController from "../../Base/AbstractServiceController";
import SWPeer from "../../Base/WebRTC/SWPeer";
import MessageChannelUtil from "../../Base/Util/MessageChannelUtil";
import GetCastSettingSedner from "../../Contents/Sender/GetCastSettingSedner";
import * as Personal from "../../Contents/IndexedDB/Personal";
import { CastVisitorView } from "./CastVisitorView";
import CastVisitorModel from "./CastVisitorModel";
import { CastVisitorReceiver } from "./CastVisitorReceiver";


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
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);
    }


    /**
     * 
     * @param conn 
     */
    public OnChildClose(conn: PeerJs.DataConnection) {
        super.OnChildClose(conn);
        this.View.Cursor.Remove(conn.peer);
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


    /**
     * 
     */
    public OnRoomOpen() {
        this.DummyJoin();
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
            element.play();
        }
    }


    /**
     * 
     * @param peerid 
     */
    public OnRoomPeerLeave(peerid: string) {
        let element = document.getElementById('sbj-video') as HTMLVideoElement;

        if (element && peerid == this._castPeerId) {
            element.hidden = true;
        }
    }

};
