
import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";

import * as HIContainer from "../HomeInstance/HomeInstanceContainer";
import * as HVContainer from "./HomeVisitorContainer";
import * as CIContainer from "../CastInstance/CastInstanceContainer";
import HomeVisitorController from "./HomeVisitorController";

export default class HomeVisitorReceiver extends AbstractServiceReceiver<HomeVisitorController> {


    /**
     * 
     * @param conn 
     * @param sender 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  インスタンス接続開始時間の保持
        if (sender.type === HIContainer.ConnInfoSender.ID) {
            this.Controller.ConnStartTime = (sender as HIContainer.ConnInfoSender).starttime;
            return;
        }

        //  ルーム変更
        if (sender.type === HIContainer.RoomSender.ID) {
            let room = (sender as HIContainer.RoomSender).room;
            this.Controller.RoomCache.Set(room);

            if (this.Controller.CurrentHid === room.hid) {
                this.Controller.View.SetRoomDisplay(room);
            }
        }

        //  ルーム内のアクターの変更
        if (sender.type === HIContainer.RoomActorMemberSender.ID) {
            let ram = (sender as HIContainer.RoomActorMemberSender);

            this.Controller.RoomCache.SetMember(ram);
            let aid = this.Controller.UseActor.CurrentAid;

            this.Controller.RoomCache.GetRoomByActorId(aid, (room) => {
                if (ram.hid === room.hid) {
                    this.Controller.View.SetRoomInfo(room);
                }
            });
        }

        //  タイムライン情報
        if (sender.type === HIContainer.TimelineSender.ID) {
            let tl = (sender as HIContainer.TimelineSender);
            this.Controller.View.SetTimeline(tl.msgs);
            this.Controller.Bot.CheckTimeline(tl.msgs);
        }


        //  タイムライン情報
        if (sender.type === HIContainer.ClearTimelineSender.ID) {
            this.Controller.View.ClearTimeline();
        }

        //  プロフィール要求
        if (sender.type === HVContainer.GetProfileSender.ID) {
            this.GetProfile(conn);
        }

        //  アクター要求
        if (sender.type === HVContainer.GetActorSender.ID) {
            this.GetActor(conn, sender as HVContainer.GetActorSender);
        }

        //  アイコン要求
        if (sender.type === HVContainer.GetIconSender.ID) {
            this.GetIcon(conn, sender as HVContainer.GetIconSender);
        }

        //  プロフィール取得
        if (sender.type === HVContainer.ProfileSender.ID) {
            //  this.Controller.ActorCache.SetOtherProfile(conn.peer, (sender as HVContainer.ProfileSender).profile);
        }

        //  アクター取得
        if (sender.type === HVContainer.ActorSender.ID) {
            //  this.Controller.ActorCache.SetOtherActor(conn.peer, (sender as HVContainer.ActorSender).actor);
        }

        //  アイコン取得
        if (sender.type === HVContainer.IconSender.ID) {
            this.Controller.IconCache.SetOtherUserIcon(conn.peer, (sender as HVContainer.IconSender).icon);
        }

        //  ライブキャストからの、起動通知 及び 設定変更通知
        if (sender.type === CIContainer.CastInstanceSender.ID) {
            this.SendCastInstance(conn.peer, sender as CIContainer.CastInstanceSender);
        }

        //  サーバント（ライブキャストを含む）の変更通知
        if (sender.type === HIContainer.RoomServantSender.ID) {
            let rs = sender as HIContainer.RoomServantSender;
            this.Controller.ServantCache.SetRoomServant(rs);

            if (rs.hid === this.Controller.CurrentHid) {
                this.Controller.View.CastSelector.ChangeRoomServantList(rs);
            }
        }

    }


    /**
     * プロフィール情報の要求
     * @param conn 
     */
    public GetProfile(conn: PeerJs.DataConnection) {
        this.Controller.Model.GetUserProfile((profile) => {
            let result = new HVContainer.ProfileSender();
            result.profile = profile;
            WebRTCService.ChildSend(conn, result);
        });
    }


    /**
     * アクター情報の要求
     * @param conn 
     * @param sender 
     */
    public GetActor(conn: PeerJs.DataConnection, sender: HVContainer.GetActorSender) {
        this.Controller.Model.GetActor(sender.aid, (actor) => {
            let result = new HVContainer.ActorSender();
            result.actor = actor;
            WebRTCService.ChildSend(conn, result);
        });
    }


    /**
     * 他クライアントからのアイコン要求通知
     * @param conn 
     * @param sender 
     */
    public GetIcon(conn: PeerJs.DataConnection, sender: HVContainer.GetIconSender) {

        this.Controller.Model.GetIcon(sender.iid, (icon) => {
            let result = new HVContainer.IconSender();
            result.icon = icon;
            WebRTCService.ChildSend(conn, result);
        });
    }


    /**
     * ライブキャストからの起動（設定変更）通知
     * @param servantPid 
     * @param cib 
     */
    private SendCastInstance(servantPid: string, cib: CIContainer.CastInstanceSender) {

        //  自身のダッシュボードへの通知
        if (cib.setting.isControlClose) {
            //  ダッシュボード側のフレームを閉じる
            this.Controller.View.NotifyLivecast("");
        }
        else if (cib.setting.isControlHide) {
            //  ダッシュボード側からフレームをハイド状態にする
            this.Controller.View.NotifyLivecastHide();
        }

        //
        this.Controller.ServantCache.GetMyServant(servantPid, cib, (sender) => {
            WebRTCService.OwnerSend(sender);
        });

    }

}
