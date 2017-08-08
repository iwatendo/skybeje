
import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";

import * as Personal from "../../Base/IndexedDB/Personal";

import * as HIContainer from "../HomeInstance/HomeInstanceContainer";
import * as HVContainer from "./HomeVisitorContainer";
import * as CIContainer from "../CastInstance/CastInstanceContainer";
import HomeVisitorController from "./HomeVisitorController";
import LogUtil from "../../Base/Util/LogUtil";
import ActorInfo from "../../Base/Container/ActorInfo";

export default class HomeVisitorReceiver extends AbstractServiceReceiver<HomeVisitorController> {


    /**
     * 
     * @param conn 
     * @param sender 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  ホームインスタンスからの接続情報の通知
        if (sender.type === HIContainer.ConnInfoSender.ID) {

            let ci = (sender as HIContainer.ConnInfoSender);

            if (ci.isBootCheck) {
                //  起動チェックに成功した場合、使用アクター情報を送信して画面を切替える
                this.Controller.ConnStartTime = (sender as HIContainer.ConnInfoSender).starttime;
                this.Controller.GetUseActors((ua) => { this.Controller.InitializeUseActors(ua); });
                LogUtil.RemoveListener();
            }
            else if (ci.isMultiBoot) {
                //  多重起動が検出された場合はエラー表示して終了
                this.Controller.HasError = true;
                this.Controller.View.MutilBootError();
                WebRTCService.Close();
            }
            else if (ci.isConnect) {
                //  多重起動の確認の為に、UserIDを送信
                WebRTCService.SendToOwner(new HVContainer.ClientBootSender());
            }
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
            ram.members.forEach((ai) => { this.Controller.ActorCache.SetActor(ai.peerid, ai); });

            let aid = this.Controller.CurrentAid;

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

        //  アクター取得
        if (sender.type === HVContainer.ActorInfoSender.ID) {
            this.Controller.ActorCache.SetActor(conn.peer, (sender as HVContainer.ActorInfoSender).actorInfo);
        }

        //  アイコン取得
        if (sender.type === HVContainer.IconSender.ID) {
            this.Controller.IconCache.SetOtherUserIcon(conn.peer, (sender as HVContainer.IconSender).icon);
        }

        //  ライブキャストからの、起動通知 及び 設定変更通知
        if (sender.type === CIContainer.CastInstanceSender.ID) {
            this.SendCastInstance(conn, sender as CIContainer.CastInstanceSender);
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
            WebRTCService.SendTo(conn, result);
        });
    }


    /**
     * アクター情報の要求
     * @param conn 
     * @param sender 
     */
    public GetActor(conn: PeerJs.DataConnection, sender: HVContainer.GetActorSender) {
        this.Controller.Model.GetActor(sender.aid, (actor) => {
            let result = new HVContainer.ActorInfoSender();
            result.actorInfo = new ActorInfo(this.Controller.PeerId, Sender.Uid, actor);
            WebRTCService.SendTo(conn, result);
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
            if (icon) {
                result.icon = icon;
            }
            else {
                //  削除済みのアイコンの場合、空データを返す。
                result.icon = new Personal.Icon();
                result.icon.iid = sender.iid;
            }

            WebRTCService.SendTo(conn, result);
        });
    }


    /**
     * ライブキャストからの起動（設定変更）通知
     * @param servantPid 
     * @param cib 
     */
    private SendCastInstance(conn: PeerJs.DataConnection, cib: CIContainer.CastInstanceSender) {

        let servantPid = conn.peer;

        //  自身のダッシュボードへの通知
        if (cib.setting.isControlClose) {
            //  ダッシュボード側のフレームを閉じる
            this.Controller.NotifyLivecast("");
        }
        else if (cib.setting.isControlHide) {
            //  ダッシュボード側からフレームをハイド状態にする
            this.Controller.NotifyLivecastHide();
        }

        //
        this.Controller.ServantCache.GetMyServant(servantPid, cib, (servantSender) => {

            let hid = servantSender.hid;

            let castroom = this.Controller.RoomCache.Get(hid, (room) => {
                let castSender = new CIContainer.CastRoomSender();
                castSender.room = room;
                WebRTCService.SendTo(conn, castSender);
            })

            WebRTCService.SendToOwner(servantSender);
        });

    }

}
