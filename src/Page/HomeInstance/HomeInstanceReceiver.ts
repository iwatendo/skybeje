
import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";
import Sender from "../../Base/Container/Sender";

import * as HVContainer from "../HomeVisitor/HomeVisitorContainer";
import * as HIContainer from "./HomeInstanceContainer";

import HomeInstanceController from "./HomeInstanceController";
import ChatManager from "./Manager/ChatManager";
import LogUtil from "../../Base/Util/LogUtil";


export default class HomeInstanceReceiver extends AbstractServiceReceiver<HomeInstanceController> {

    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  クライアントの起動通知
        if (sender.type === HVContainer.ClientBootSender.ID) {
            let ci = new HIContainer.ConnInfoSender();
            let mbc = this.IsMultiBoot(sender.uid, conn);
            ci.isBootCheck = !mbc;
            ci.isMultiBoot = mbc;
            this.Controller.SwPeer.SendTo(conn, ci);
            return;
        }

        //  ルームの要求
        if (sender.type === HIContainer.GetRoomSender.ID) {
            this.Controller.SendRoom(conn, sender as HIContainer.GetRoomSender);
        }

        //  使用アクター通知
        if (sender.type === HVContainer.UseActorSender.ID) {
            let useActor = sender as HVContainer.UseActorSender;
            this.Controller.Manager.Room.SetActor(conn, useActor);
        }

        //  チャットメッセージ通知
        if (sender.type === HVContainer.ChatMessageSender.ID) {
            let chatMessage = sender as HVContainer.ChatMessageSender;
            this.Controller.Manager.Chat.SetMessage(chatMessage);
        }

        //  タイムラインの要求
        if (sender.type === HVContainer.GetTimelineSender.ID) {
            let gtl = sender as HVContainer.GetTimelineSender;
            let result = new HIContainer.TimelineSender();
            result.msgs = this.Controller.Manager.Chat.GetBeforeMessages(gtl.hid, gtl.count);
            this.Controller.SwPeer.SendTo(conn, result);
        }

        //  タイムラインの更新
        if (sender.type === HIContainer.UpdateTimelineSender.ID) {
            let utl = sender as HIContainer.UpdateTimelineSender;
            this.Controller.Manager.Chat.UpdateTimeline(utl.message);
        }

        //  サーバントの起動/更新通知
        if (sender.type === HIContainer.ServentSender.ID) {
            this.Controller.Manager.Servent.SetServent(sender as HIContainer.ServentSender);
        }

        //  サーバントの終了通知
        if (sender.type === HIContainer.ServentCloseSender.ID) {
            this.Controller.Manager.Servent.CloseServent(sender as HIContainer.ServentCloseSender);
        }

        //  強制終了処理
        if (sender.type === HIContainer.ForcedTerminationSender.ID) {
            this.Controller.SwPeer.Close();
        }

        //  ボイスチャットルームのメンバー通知
        if (sender.type === HIContainer.VoiceChatMemberSender.ID) {
            this.Controller.Manager.VoiceChat.SetMember(sender as HIContainer.VoiceChatMemberSender);
        }

    }


    /**
     * ユーザーID毎の接続MAP
     */
    private _userConnMap = new Map<string, PeerJs.DataConnection>();


    /**
     * 
     * @param uid 
     * @param peerid 
     */
    private IsMultiBoot(uid: string, conn: PeerJs.DataConnection): boolean {

        if (this._userConnMap.has(uid)) {
            let preConn = this._userConnMap.get(uid);

            if (preConn.open) {
                if (preConn.peer === conn.peer) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                //  接続が切れていた場合は上書き
                this._userConnMap.set(uid, conn);
                return false;
            }
        }
        else {
            //  未登録だった場合
            this._userConnMap.set(uid, conn);
            return false;
        }
    }

}
