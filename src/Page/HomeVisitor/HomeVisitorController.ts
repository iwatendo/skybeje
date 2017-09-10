
import * as Timeline from "../../Base/IndexedDB/Timeline";
import * as Personal from "../../Base/IndexedDB/Personal";
import * as Home from "../../Base/IndexedDB/Home";

import * as HVContainer from "./HomeVisitorContainer";

import AbstractServiceController from "../../Base/Common/AbstractServiceController";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import LogUtil from "../../Base/Util/LogUtil";
import ActorInfo from "../../Base/Container/ActorInfo";
import { OnRead } from "../../Base/Common/AbstractServiceModel";
import { Order } from "../../Base/Container/Order";
import { CastTypeEnum } from "../../Base/Container/CastInstanceSender";

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
    public ActorCache: ActorCache;
    public RoomCache: RoomCache;
    public IconCache: IconCache;
    public TimelineCache: TimelineCache;
    public ServantCache: ServantCache;
    public Bot: BotController;
    public Log: LogController;

    public UseActors: Array<Personal.Actor>;

    private _currentActor: Personal.Actor;

    public get CurrentAid(): string {
        return (this._currentActor ? this._currentActor.aid : "");
    }
    public get CurrentActor(): Personal.Actor { return this._currentActor; }
    public CurrentHid: string;
    public HasError: boolean;

    /**
     *
     */
    constructor() {
        super();
        this.HasError = false;
        this.Log = new LogController(this);
        this.Receiver = new HomeVisitorReceiver(this);
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
        this.UseActors = new Array<Personal.Actor>();

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
        //  多重起動の確認の為に、UserIDを送信
        WebRTCService.SendToOwner(new HVContainer.ClientBootSender());
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
    public GetUseActors(callback: OnRead<Array<Personal.Actor>>) {

        this.Model.GetActors((actors) => {
            Order.Sort(actors);
            let result = new Array<Personal.Actor>();
            actors.forEach((actor) => {
                if (actor.isUserProfile || actor.isUsing) {
                    result.push(actor);
                }
            });
            callback(result);
        });
    }

    /**
     * 使用アクターの初期値設定
     * @param ua 
     */
    public InitializeUseActors(ua: Array<Personal.Actor>) {
        let aid = ua[0].aid;
        this.Model.GetActor(aid, (actor) => {
            this._currentActor = actor;
            this.SetUseActors(ua);
        });
    }

    /**
     * 
     */
    public SetUseActors(useActors: Array<Personal.Actor>) {
        this.UseActors = useActors;

        let sender = new UseActorSender();
        let peerid = this.PeerId;
        let uid = sender.uid;

        useActors.forEach((a) => {
            sender.ActorInfos.push(new ActorInfo(peerid, uid, a));
        });

        WebRTCService.SendToOwner(sender);
    }


    /**
     * アクター情報及び使用アクターに変更があった場合に
     * 変更内容をホームインスタンスに通知
     * @param aid 
     */
    public ChagneActorInfo(aid: string) {

        let useActor = this.UseActors;
        let peerId = this.PeerId;

        this.Model.GetActor(aid, (newActor) => {

            let preUsing = false;
            let newList = new Array<Personal.Actor>();

            //  アクターデータの差替え
            useActor.forEach((pre) => {
                if (pre.aid === aid) {
                    preUsing = true;
                    if (newActor.isUserProfile || newActor.isUsing) {
                        newList.push(newActor);
                    }
                }
                else {
                    newList.push(pre);
                }
            });

            //  新しく配置されたアクターの場合
            if (!preUsing && newActor.isUsing) {
                newList.push(newActor);
            }

            //  カレントのアクターが配置解除された場合、別のアクターに切替える
            if (newList.filter((ap) => ap.aid === this.CurrentAid).length === 0) {
                this.ChangeCurrentActor(newList[0].aid);
            }

            this.SetUseActors(newList);
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
                this.View.CastSelector.NotifyServantToActorAll();
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
     * ダッシュボードへライブキャスト／スクリーンシェアの起動通知
     * @param peerid 
     * @param isScreenShare 
     */
    public NotifyBootLiveCast(peerid: string, castType: CastTypeEnum) {

        let elementName = "";

        switch (castType) {
            case CastTypeEnum.LiveCast: elementName = "sbj-main-home-livecast-id"; break;
            case CastTypeEnum.ScreenShare: elementName = "sbj-main-home-livecast-screenshare-id"; break;
            case CastTypeEnum.Gadget: elementName = "sbj-main-home-livecast-gadget-id"; break;
            default: return;
        }

        let element = window.parent.document.getElementById(elementName);
        if (element) {
            element.textContent = peerid;
            element.click();
        }
    }


    /**
     * ダッシュボードへ、ライブキャスト／スクリーンシェアのハイド通知
     */
    public NotifyHideLiveCast(castType: CastTypeEnum) {

        let elementName = "";

        switch (castType) {
            case CastTypeEnum.LiveCast: elementName = "sbj-main-home-livecast-hide"; break;
            case CastTypeEnum.ScreenShare: elementName = "sbj-main-home-livecast-screenshare-hide"; break;
            case CastTypeEnum.Gadget: elementName = "sbj-main-home-livecast-gadget-hide"; break;
            default: return;
        }

        let element = window.parent.document.getElementById(elementName);
        if (element) {
            element.click();
        }
    }


    /**
     *　ダッシュボードへ、前回分のライブキャスト情報が残らないようにクリア情報を通知する
     */
    public NotifyClearLiveCast() {
        this.NotifyBootLiveCast("", CastTypeEnum.LiveCast);
        this.NotifyBootLiveCast("", CastTypeEnum.ScreenShare);
        this.NotifyBootLiveCast("", CastTypeEnum.Gadget);
    }

};
