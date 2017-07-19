
import * as Timeline from "../../Base/IndexedDB/Timeline";
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import ConnectionCache from "../../Base/Common/ConnectionCache";
import LogUtil from "../../Base/Util/LogUtil";

import { GetRoomSender, RoomActorMemberSender, UpdateTimelineSender, ServantCloseSender } from "../HomeInstance/HomeInstanceContainer";
import TimelineCache from "./Cache/TimelineCache";
import RoomCache from "./Cache/RoomCache";
import IconCache from "./Cache/IconCache";
import ServantCache from "./Cache/ServantCache";
import HomeVisitorReceiver from "./HomeVisitorReceiver";
import HomeVisitorView from "./HomeVisitorView";
import HomeVisitorModel from "./HomeVisitorModel";
import { UseActorSender, ChatMessageSender, GetTimelineSender } from "./HomeVisitorContainer";
import BotController from "./BotController";
import ActorPeer from "../../Base/Container/ActorPeer";


/**
 * 
 */
export default class HomeVisitorController extends AbstractServiceController<HomeVisitorView, HomeVisitorModel> {

    public PeerId: string;
    public ConnStartTime: number;
    public ConnCache: ConnectionCache;
    public RoomCache: RoomCache;
    public IconCache: IconCache;
    public TimelineCache: TimelineCache;
    public ServantCache: ServantCache;

    public UseActor: UseActorSender;
    public CurrentHid: string;

    public Bot: BotController;

    /**
     *
     */
    constructor() {
        super();
        this.Receiver = new HomeVisitorReceiver(this);
        this.ConnCache = new ConnectionCache();
        this.RoomCache = new RoomCache(this);
        this.IconCache = new IconCache(this);
        this.TimelineCache = new TimelineCache(this);
        this.ServantCache = new ServantCache(this);
        this.Bot = new BotController(this);
    };


    /**
     * 自身のPeer生成時イベント
     * ※サーバー用のPeerID取得時イベント
     * @param peer
     */
    public OnPeerOpen(peer: PeerJs.Peer) {

        //  
        this.PeerId = peer.id;
        this.UseActor = new UseActorSender(null);

        //  DB接続
        this.Model = new HomeVisitorModel(this, () => {
            //  UI初期化
            this.View = new HomeVisitorView(this, () => {

            });
        });

        //  HomeInstanceへEntrance情報の取得
    }


    /**
     * 
     */
    public OnOwnerConnection() {

        this.Model.GetUserProfile((actor) => {
            let useActor = new UseActorSender(actor);
            useActor.ActorPeers.push(new ActorPeer(actor, this.PeerId));
            this.SetUseActor(useActor);
        });

    }


    /**
     * 
     */
    public OnOwnerClose() {
        this.View.DisConnect();
    }


    /**
     * 
     * @param err
     */
    public OnPeerError(err: Error) {

        if ((err as any).type === "peer-unavailable") {
            LogUtil.Warning(err.message);
            let peerid = err.message.replace("Could not connect to peer ", "").replace("'", "");
            this.ConnCache.SetErrorPeer(peerid);
        }
        else {
            this.View.DisConnect();
            LogUtil.Error('peer error');
            LogUtil.Error(err.message);
            LogUtil.FatalError(err.message);
        }
    }

    /**
     * 
     * @param conn 
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        LogUtil.Info('Child peer connection : ' + conn.peer.toString());
        this.ConnCache.Set(conn);
    }


    /**
     * 
     * @param conn 
     */
    public OnChildClose(conn: PeerJs.DataConnection) {

        let sender = new ServantCloseSender();
        sender.servantPeerId = conn.peer;
        sender.ownerPeerid = this.PeerId;
        WebRTCService.OwnerSend(sender);

    }

    /**
     * 
     */
    public SetUseActor(useActor: UseActorSender) {
        this.UseActor = useActor;
        WebRTCService.OwnerSend(useActor);
    }


    /**
     * ダッシュボードで、プロフィール/アクター情報が変更された場合の処理
     * @param aid 
     */
    public ChagneActorInfo(aid: string) {

        this.UseActor.ActorPeers.forEach((ap) => {

            //  UseActorに含まれていた場合、IndexedDBからデータを取り直してインスタンス側に通知する
            if (ap.actor.aid === aid) {
                this.Model.GetActor(aid, (newActor) => {
                    ap.actor = newActor;
                    this.SetUseActor(this.UseActor);
                });
            }
        });

    }


    /**
     * 
     * @param chatMessage 
     */
    public SendChatMessage(chatMessage: ChatMessageSender) {
        WebRTCService.OwnerSend(chatMessage);
    }


    /**
     * タイムライン情報の取得
     * @param hid 
     */
    public GetTimeline(hid: string) {
        let sender = new GetTimelineSender();
        sender.hid = hid;
        sender.count = 256;
        WebRTCService.OwnerSend(sender);
    }


    /**
     * タイムラインの修正処理
     * @param tml 
     */
    public UpdateTimeline(tml: Timeline.Message) {
        let sender = new UpdateTimelineSender();
        sender.message = tml;
        WebRTCService.OwnerSend(sender);
    }


    /**
     * ルーム情報表示
     * @param roomActorMember 
     */
    public ChangeCurrentActor(aid: string) {

        this.Model.GetActor(aid, (actor) => {
            this.UseActor.CurrentAid = actor.aid;
            this.UseActor.CurrentIid = (actor.iconIds.length === 0 ? "" : actor.iconIds[0]);
            this.RoomCache.GetRoomByActorId(aid, (room) => {
                this.View.SetRoomInfo(room);
                this.View.CastSelector.NotifyServantToActor();
            });
        });

    }


    /**
     * ダッシュボードへ起動したインスンタンスIDを通知
     */
    public NotifyDashbord(peerid: string) {
        let element = window.parent.document.getElementById('sbj-main-home-visitor-id');
        if (element) {
            element.textContent = peerid;
            element.click();
        }
    }


    /**
     * ダッシュボード側へ選択アクターを通知
     * @param aid 
     * @param isOpenProfile 
     */
    public NotifyShowProfile(aid:string, isOpenProfile:boolean) {
        let element = window.parent.document.getElementById('sbj-main-home-visitor-profile-id');
        if (element) {
            element.textContent = aid;
            element.click();
        }
    }


    /**
     * ダッシュボードへライブキャストの起動を通知
     */
    public NotifyLivecast(peerid: string) {

        let element = window.parent.document.getElementById('sbj-main-home-livecast-id');
        if (element) {
            element.textContent = peerid;
            element.click();
        }
    }


    /**
     * ダッシュボードへ、ライブキャストのハイド通知
     */
    public NotifyLivecastHide() {

        let element = window.parent.document.getElementById('sbj-main-home-livecast-hide');
        if (element) {
            element.click();
        }
    }

};
