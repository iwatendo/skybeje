import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import LogUtil from "../../Base/Util/LogUtil";
import SpeechUtil from "../../Base/Util/SpeechUtil";

import Sender from "../../Base/Container/Sender";
import CastInstanceSender from "../../Base/Container/CastInstanceSender";

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
                this.Controller.SwPeer.Close();
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
            this.Controller.View.SetTimeline(tl.msgs);
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
            this.Controller.ActorCache.SetActor(conn.peer, (sender as ActorInfoSender).actorInfo);
        }

        //  アイコン取得
        if (sender.type === IconSender.ID) {
            this.Controller.IconCache.SetOtherUserIcon(conn.peer, (sender as IconSender).icon);
        }

        //  ライブキャストからの、起動通知 及び 設定変更通知
        if (sender.type === CastInstanceSender.ID) {
            this.SendCastInstance(conn, sender as CastInstanceSender);
        }

        //  サーバント（ライブキャストを含む）の変更通知
        if (sender.type === RoomServentSender.ID) {
            let rs = sender as RoomServentSender;
            this.Controller.ServentCache.SetRoomServent(rs);

            if (rs.hid === this.Controller.CurrentHid) {
                this.Controller.View.CastSelector.ChangeRoomServentList(rs);
            }
        }

        //  ボイスチャットルームメンバーの変更通知
        if (sender.type === VoiceChatMemberListSender.ID) {
            this.Controller.View.InputPane.ChangeVoiceChatMember(sender as VoiceChatMemberListSender);
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
            result.actorInfo = new ActorInfo(this.Controller.PeerId, Sender.Uid, actor);
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
     * ライブキャストからの起動（設定変更）通知
     * @param serventPid 
     * @param cib 
     */
    private SendCastInstance(conn: PeerJs.DataConnection, cib: CastInstanceSender) {

        let serventPid = conn.peer;

        //  自身のダッシュボードへの通知
        if (cib.isClose) {
            //  ダッシュボード側のフレームを閉じる
            this.Controller.NotifyBootLiveCast("", cib.castType);
        }
        else if (cib.isHide) {
            //  ダッシュボード側からフレームをハイド状態にする
            this.Controller.NotifyHideLiveCast(cib.castType);
        }

        //
        this.Controller.ServentCache.GetMyServent(serventPid, cib, (serventSender) => {

            let hid = serventSender.hid;

            let castroom = this.Controller.RoomCache.Get(hid, (room) => {
                let castSender = new RoomSender();
                castSender.room = room;
                this.Controller.SwPeer.SendTo(conn, castSender);
            })

            this.Controller.SwPeer.SendToOwner(serventSender);
        });

    }

}
