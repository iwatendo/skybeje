import AbstractServiceReceiver from "../../Base/AbstractServiceReceiver";

import Sender from "../../Base/Container/Sender";
import VoiceChatController from "./VoiceChatController";
import VoiceChatMemberListSender from "../../Contents/Sender/VoiceChatMemberListSender";

export default class VoiceChatReceiver extends AbstractServiceReceiver<VoiceChatController> {

    /**
     * 
     * @param conn 
     * @param sender 
     */
    public Receive(conn: PeerJs.DataConnection, sender: Sender) {

        //  ボイスチャットルームメンバーの変更通知
        if (sender.type === VoiceChatMemberListSender.ID) {
            this.Controller.View.ChangeVoiceChatMember(sender as VoiceChatMemberListSender);
        }

    }

}
