import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import LogUtil from "../../Base/Util/LogUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";
import StdUtil from "../../Base/Util/StdUtil";

import Sender from "../../Base/Container/Sender";
import CastStatusSender from "../../Base/Container/CastStatusSender";

import * as Personal from "../../Contents/IndexedDB/Personal";
import ActorInfo from "../../Contents/Struct/ActorInfo";

import HomeVisitorController from "./HomeVisitorController";

import ConnInfoSender from "../../Contents/Sender/ConnInfoSender";
import RoomSender from "../../Contents/Sender/RoomSender";
import RoomActorMemberSender from "../../Contents/Sender/RoomActorMemberSender";
import TimelineSender from "../../Contents/Sender/TimelineSender";
import ClearTimelineSender from "../../Contents/Sender/ClearTimelineSender";
import GetProfileSender from "../../Contents/Sender/GetProfileSender";
import GetActorSender from "../../Contents/Sender/GetActorSender";
import GetIconSender from "../../Contents/Sender/GetIconSender";
import GetGuideSender from "../../Contents/Sender/GetGuideSender";
import ActorInfoSender from "../../Contents/Sender/ActorInfoSender";
import IconSender from "../../Contents/Sender/IconSender";
import RoomServentSender from "../../Contents/Sender/RoomServentSender";
import VoiceChatMemberListSender from "../../Contents/Sender/VoiceChatMemberListSender";
import ProfileSender from "../../Contents/Sender/ProfileSender";
import GuideSender from "../../Contents/Sender/GuideSender";
import ProfileChangeSender from "../../Contents/Sender/ProfileChangeSender";
import SettingsChangeSender from "../../Contents/Sender/SettingsChangeSender";
import InitializeSender from "../../Contents/Sender/InitializeSender";
import LinkUtil from "../../Base/Util/LinkUtil";
import LiveHTMLMessageSender from "../../Contents/Sender/LiveHTMLMessageSender";
import ChatMessageSender from "../../Contents/Sender/ChatMessageSender";
import AudioBlobSender from "../../Contents/Sender/AudioBlobSender";
import SWMsgPack from "../../Base/WebRTC/SWMsgPack";
import RecordingUtil from "../../Base/Util/RecordingUtil";

export default class HomeVisitorReceiver extends AbstractServiceReceiver<HomeVisitorController> {


    /**
     * 
     * @param conn 
     * @param sender 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  ホームインスタンスからの接続情報の通知
        if (sender.type === ConnInfoSender.ID) {

            let ci = (sender as ConnInfoSender);

            if (ci.isBootCheck) {
                //  起動チェックに成功した場合、使用アクター情報を送信して画面を切替える
                this.Controller.ConnStartTime = (sender as ConnInfoSender).starttime;
                this.Controller.GetUseActors((ua) => { this.Controller.InitializeUseActors(ua); });
                LogUtil.RemoveListener();
                SpeechUtil.SetStartTime(ci.starttime);
            }
            else if (ci.isMultiBoot) {
                //  多重起動が検出された場合はエラー表示して終了
                this.Controller.HasError = true;
                this.Controller.View.MutilBootError();
                this.Controller.SwPeer.AllCloseRequest();
                //  this.Controller.SwPeer.CloseAll();
            }
            return;
        }

        //  ルーム変更
        if (sender.type === RoomSender.ID) {
            let room = (sender as RoomSender).room;
            this.Controller.RoomCache.Set(room);

            if (this.Controller.CurrentHid === room.hid) {
                this.Controller.View.SetRoomDisplay(room);
            }
        }

        //  ルーム内のアクターの変更
        if (sender.type === RoomActorMemberSender.ID) {
            let ram = (sender as RoomActorMemberSender);

            this.Controller.RoomCache.SetMember(ram);
            ram.members.forEach((ai) => { this.Controller.ActorCache.SetActor(ai.peerid, ai); });

            let aid = this.Controller.CurrentAid;

            this.Controller.RoomCache.GetRoomByActorId(aid, (room) => {
                if (ram.hid === room.hid) {
                    this.Controller.View.SetRoomInfo(room);
                }
            });
        }

        //  タイムライン情報
        if (sender.type === TimelineSender.ID) {
            let tl = (sender as TimelineSender);
            this.Controller.View.SetTimeline(tl.msgs, tl.ings);
            this.Controller.Bot.CheckTimeline(tl.msgs);
        }


        //  タイムライン情報
        if (sender.type === ClearTimelineSender.ID) {
            this.Controller.View.ClearTimeline();
        }

        //  プロフィール要求
        if (sender.type === GetProfileSender.ID) {
            this.GetProfile(conn);
        }

        //  アクター要求
        if (sender.type === GetActorSender.ID) {
            this.GetActor(conn, sender as GetActorSender);
        }

        //  アイコン要求
        if (sender.type === GetIconSender.ID) {
            this.GetIcon(conn, sender as GetIconSender);
        }

        //  ガイド要求
        if (sender.type === GetGuideSender.ID) {
            this.GetGuide(conn);
        }

        //  アクター取得
        if (sender.type === ActorInfoSender.ID) {
            this.Controller.ActorCache.SetActor(conn.remoteId, (sender as ActorInfoSender).actorInfo);
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.IconCache.SetOtherUserIcon(conn.remoteId, (sender as IconSender).icon);
        }

        //  プライベート配信からの、起動通知 及び 設定変更通知
        if (sender.type === CastStatusSender.ID) {
            this.SendCastInstance(conn, sender as CastStatusSender);
        }

        //  サーバント（プライベート配信を含む）の変更通知
        if (sender.type === RoomServentSender.ID) {
            let rs = sender as RoomServentSender;
            this.Controller.ServentCache.SetRoomServent(rs);

            if (rs.hid === this.Controller.CurrentHid) {
                this.Controller.View.CastSelector.ChangeRoomServentList(rs);
            }
        }

        //  ボイスチャットルームメンバーの変更通知
        if (sender.type === VoiceChatMemberListSender.ID) {
            if (this.Controller.View.InputPane) {
                this.Controller.View.InputPane.ChangeVoiceChatMember(sender as VoiceChatMemberListSender);
            }
        }

        if (sender.type === LiveHTMLMessageSender.ID) {
            this.ConvertLiveHTMLMessage(sender as LiveHTMLMessageSender, (chatmsg) => {
                this.Controller.SwPeer.SendToOwner(chatmsg);
            });
        }


        //  音声再生
        if (sender.type === AudioBlobSender.ID) {
            let abs = sender as AudioBlobSender;
            let blob = SWMsgPack.ArrayToBlob(abs.binary);

            //  再生処理
            let url =URL.createObjectURL(blob);
            var music = new Audio(url);
            music.play();
        }

    }


    /**
     * 
     * @param sender 
     */
    public MessageChannelRecive(sender: Sender) {

        //  
        if (sender.type === ProfileChangeSender.ID) {
            let pcs = sender as ProfileChangeSender;
            this.Controller.View.InputPane.ProfileChange(pcs);
        }

        //  
        if (sender.type === SettingsChangeSender.ID) {
            let scs = sender as SettingsChangeSender;
            if (scs.isClose) {
                this.Controller.View.InputPane.UserSettingChange();
            }
        }

        if (sender.type === InitializeSender.ID) {
            location.href = LinkUtil.CreateLink("../Initialize/");
        }

    }

    /**
     * プロフィール情報の要求
     * @param conn 
     */
    public GetProfile(conn: PeerJs.DataConnection) {
        this.Controller.Model.GetUserProfile((profile) => {
            let result = new ProfileSender();
            result.profile = profile;
            this.Controller.SwPeer.SendTo(conn, result);
        });
    }


    /**
     * アクター情報の要求
     * @param conn 
     * @param sender 
     */
    public GetActor(conn: PeerJs.DataConnection, sender: GetActorSender) {
        this.Controller.Model.GetActor(sender.aid, (actor) => {
            let result = new ActorInfoSender();
            result.actorInfo = new ActorInfo(this.Controller.PeerId, StdUtil.UserID, actor);
            this.Controller.SwPeer.SendTo(conn, result);
        });
    }


    /**
     * 他クライアントからのアイコン要求通知
     * @param conn 
     * @param sender 
     */
    public GetIcon(conn: PeerJs.DataConnection, sender: GetIconSender) {

        this.Controller.Model.GetIcon(sender.iid, (icon) => {
            let result = new IconSender();
            if (icon) {
                result.icon = icon;
            }
            else {
                //  削除済みのアイコンの場合、空データを返す。
                result.icon = new Personal.Icon();
                result.icon.iid = sender.iid;
            }

            this.Controller.SwPeer.SendTo(conn, result);
        });
    }


    /**
     * ガイド情報の取得
     * @param conn 
     */
    public GetGuide(conn: PeerJs.DataConnection) {
        let result = new GuideSender();
        result.guide = this.Controller.Bot.GetGuideQueue();
        this.Controller.SwPeer.SendTo(conn, result);
    }


    /**
     * プライベート配信からの起動（設定変更）通知
     * @param serventPid 
     * @param cib 
     */
    private SendCastInstance(conn: PeerJs.DataConnection, cib: CastStatusSender) {

        let serventPid = conn.remoteId;

        //
        this.Controller.ServentCache.GetMyServent(serventPid, cib, (serventSender) => {

            let hid = serventSender.hid;

            let castroom = this.Controller.RoomCache.Get(hid, (room) => {
                let castSender = new RoomSender();
                castSender.room = room;
                this.Controller.SwPeer.SendTo(conn, castSender);
            });

            this.Controller.SwPeer.SendToOwner(serventSender);
        });

    }


    /**
     * LiveHTMLからのメッセージをチャットメッセージに変換して送信
     * @param sender 
     * @param callback 
     */
    private ConvertLiveHTMLMessage(sender: LiveHTMLMessageSender, callback) {

        let chatmsg = new ChatMessageSender();
        chatmsg.text = sender.text;
        let ic = sender.iconCurosr;

        if (ic) {
            chatmsg.aid = ic.aid;
            chatmsg.iid = ic.iid;
            chatmsg.peerid = ic.homePeerId;

            this.Controller.ActorCache.GetActor(ic.homePeerId, ic.aid, (actor) => {
                chatmsg.name = actor.name + "(LiveHTML)";
                callback(chatmsg);
            });
        }
        else {
            let ca = this.Controller.CurrentActor;
            chatmsg.aid = ca.aid;
            chatmsg.peerid = this.Controller.SwPeer.PeerId;
            chatmsg.name = "Guest";
            callback(chatmsg);
        }
    }

}
