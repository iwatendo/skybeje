
import * as Timeline from "../../Base/IndexedDB/Timeline";
import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";

import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import ConnectionCache from "../../Base/Common/ConnectionCache";
import LogUtil from "../../Base/Util/LogUtil";
import ActorPeer from "../../Base/Container/ActorPeer";
import { OnRead } from "../../Base/Common/AbstractServiceModel";
import { Order } from "../../Base/Container/Order";

import { GetRoomSender, RoomActorMemberSender, UpdateTimelineSender, ServantCloseSender } from "../HomeInstance/HomeInstanceContainer";
import TimelineCache from "./Cache/TimelineCache";
import ActorCache from "./Cache/ActorCache";
import RoomCache from "./Cache/RoomCache";
import IconCache from "./Cache/IconCache";
import ServantCache from "./Cache/ServantCache";
import HomeVisitorReceiver from "./HomeVisitorReceiver";
import HomeVisitorView from "./HomeVisitorView";
import HomeVisitorModel from "./HomeVisitorModel";
import { UseActorSender, ChatMessageSender, GetTimelineSender } from "./HomeVisitorContainer";
import BotController from "./BotController";
import LogController from "./Log/LogController";


/**
 * 
 */
export default class HomeVisitorController extends AbstractServiceController<HomeVisitorView, HomeVisitorModel> {

    public ControllerName(): string { return "HomeVisitor"; }

    public PeerId: string;
    public ConnStartTime: number;
    public ConnCache: ConnectionCache;
    public ActorCache: ActorCache;
    public RoomCache: RoomCache;
    public IconCache: IconCache;
    public TimelineCache: TimelineCache;
    public ServantCache: ServantCache;
    public Bot: BotController;
    public Log: LogController;

    public UseActor: UseActorSender;

    private _currentActor: Personal.Actor;

    public get CurrentAid(): string { return this._currentActor.aid; }
    public get CurrentActor(): Personal.Actor { return this._currentActor; }
    public CurrentHid: string;

    /**
     *
     */
    constructor() {
        super();
        this.Log = new LogController(this);
        this.Receiver = new HomeVisitorReceiver(this);
        this.ConnCache = new ConnectionCache();
        this.ActorCache = new ActorCache(this);
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
        this.UseActor = new UseActorSender();

        //  DB接続
        this.Model = new HomeVisitorModel(this, () => {
            //  UI初期化
            this.View = new HomeVisitorView(this, () => {

            });
        });

    }


    /**
     * 
     */
    public OnOwnerConnection() {
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
            LogUtil.Warning(this, err.message);
            let peerid = err.message.replace("Could not connect to peer ", "").replace("'", "");
            this.ConnCache.SetErrorPeer(peerid);
        }
        else {
            this.View.DisConnect();
            LogUtil.Error(this, 'peer error');
            LogUtil.Error(this, err.message);
            LogUtil.FatalError(err.message);
        }
    }


    /**
     * 
     * @param conn 
     */
    public OnChildConnection(conn: PeerJs.DataConnection) {
        super.OnChildConnection(conn);
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
        WebRTCService.SendToOwner(sender);

    }

    /**
     * 
     * @param callback 
     */
    public GetUseActor(callback: OnRead<UseActorSender>) {

        this.Model.GetActors((actors) => {
            Order.Sort(actors);
            let useActor = new UseActorSender();
            actors.forEach((actor) => {
                if (actor.isUserProfile || actor.isUsing) {
                    useActor.ActorPeers.push(new ActorPeer(this.PeerId, useActor.uid, actor));
                }
            });
            callback(useActor);
        });
    }

    /**
     * 使用アクターの初期値設定
     * @param ua 
     */
    public InitializeUseActor(ua: UseActorSender) {
        let aid = ua.ActorPeers[0].actor.aid;
        this.Model.GetActor(aid, (actor) => {
            this._currentActor = actor;
            this.SetUseActor(ua);
        });
    }

    /**
     * 
     */
    public SetUseActor(useActor: UseActorSender) {
        this.UseActor = useActor;
        WebRTCService.SendToOwner(useActor);
    }


    /**
     * アクター情報及び使用アクターに変更があった場合に
     * 変更内容をホームインスタンスに通知
     * @param aid 
     */
    public ChagneActorInfo(aid: string) {

        let useActor = this.UseActor;
        let peerId = this.PeerId;

        this.Model.GetActor(aid, (actor) => {

            let preUsing = false;
            let newApList = new Array<ActorPeer>();

            //  アクターデータの差替え
            useActor.ActorPeers.forEach((ap) => {
                if (ap.actor.aid === aid) {
                    preUsing = true;
                    if (actor.isUserProfile || actor.isUsing) {
                        ap.actor = actor;
                        newApList.push(ap);
                    }
                }
                else {
                    newApList.push(ap);
                }
            });

            //  新しく配置されたアクターの場合
            if (!preUsing && actor.isUsing) {
                newApList.push(new ActorPeer(peerId, useActor.uid, actor));
            }

            //  カレントのアクターが配置解除された場合、別のアクターに切替える
            if (newApList.filter((ap) => ap.actor.aid === this.CurrentAid).length === 0) {
                this.ChangeCurrentActor(newApList[0].actor.aid);
            }

            useActor.ActorPeers = newApList;
            this.SetUseActor(useActor);
        });

    }


    /**
     * 
     * @param chatMessage 
     */
    public SendChatMessage(chatMessage: ChatMessageSender) {
        WebRTCService.SendToOwner(chatMessage);
    }


    /**
     * タイムライン情報の取得
     * @param hid 
     */
    public GetTimeline(hid: string) {
        let sender = new GetTimelineSender();
        sender.hid = hid;
        sender.count = 256;
        WebRTCService.SendToOwner(sender);
    }


    /**
     * タイムラインの修正処理
     * @param tml 
     */
    public UpdateTimeline(tml: Timeline.Message) {
        let sender = new UpdateTimelineSender();
        sender.message = tml;
        WebRTCService.SendToOwner(sender);
    }


    /**
     * 発言アクターを変更
     * @param aid 
     */
    public ChangeCurrentActor(aid: string) {

        this.Model.GetActor(aid, (actor) => {

            this._currentActor = actor;

            //  表示変更
            this.View.InputPane.DisplayActor();

            //  変更したアクターの部屋へ変更
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
    public NotifyShowProfile(aid: string, isOpenProfile: boolean) {
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
