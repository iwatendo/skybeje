
import AbstractServiceReceiver from "../../Base/Common/AbstractServiceReceiver";
import WebRTCService from "../../Base/Common/WebRTCService";
import Sender from "../../Base/Container/Sender";

import * as HVContainer from "../HomeVisitor/HomeVisitorContainer";
import * as HIContainer from "./HomeInstanceContainer";

import HomeInstanceController from "./HomeInstanceController";
import ChatManager from "./Manager/ChatManager";


export default class HomeInstanceReceiver extends AbstractServiceReceiver<HomeInstanceController> {


    /**
     * 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  クライアントの起動通知
        if (sender.type === HVContainer.ClientBootSender.ID) {
            let ci = new HIContainer.ConnInfoSender();
            ci.isConnect = true;
            let checkResult = this.Controller.ConnCache.SetUser(sender.uid, conn);
            ci.isBootCheck = checkResult;
            ci.isMultiBoot = !checkResult;
            WebRTCService.SendTo(conn, ci);
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
            WebRTCService.SendTo(conn, result);
        }

        //  タイムラインの更新
        if (sender.type === HIContainer.UpdateTimelineSender.ID) {
            let utl = sender as HIContainer.UpdateTimelineSender;
            this.Controller.Manager.Chat.UpdateTimeline(utl.message);
        }

        //  サーバントの起動/更新通知
        if (sender.type === HIContainer.ServantSender.ID) {
            this.Controller.Manager.Servant.SetServant(sender as HIContainer.ServantSender);
        }

        //  サーバントの終了通知
        if (sender.type === HIContainer.ServantCloseSender.ID) {
            this.Controller.Manager.Servant.CloseServant(sender as HIContainer.ServantCloseSender);
        }

        //  強制終了処理
        if (sender.type === HIContainer.ForcedTerminationSender.ID) {
            WebRTCService.Close();
        }

    }

}
