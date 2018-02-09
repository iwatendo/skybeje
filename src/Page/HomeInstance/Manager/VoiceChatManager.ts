import HomeInstanceController from "../HomeInstanceController";

import VoiceChatMemberSender from "../../../Contents/Sender/VoiceChatMemberSender";
import VoiceChatMemberListSender from "../../../Contents/Sender/VoiceChatMemberListSender";


export default class VoiceChatManager {

    private _controller: HomeInstanceController;
    private _voiceChatMemberList = new Array<VoiceChatMemberSender>();


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeInstanceController) {
        this._controller = controller;
    }


    /**
     * ボイスチャットルームの接続メンバ－の管理と通知
     * @param sender 
     */
    public SetMember(sender: VoiceChatMemberSender) {

        if (sender.isMember) {
            let list = this._voiceChatMemberList.filter((p) => p.peerid === sender.peerid);
            if (list.length === 0) {
                this._voiceChatMemberList.push(sender);
            }
        }
        else {
            this._voiceChatMemberList = this._voiceChatMemberList.filter((p) => p.peerid !== sender.peerid);
        }
        this.SendMemberList();
    }


    /**
     * ボイスチャットのメンバーリストの通知
     */
    public SendMemberList(){
        let listSender = new VoiceChatMemberListSender();
        listSender.Members = this._voiceChatMemberList;
        this._controller.SwPeer.SendAll(listSender);
    }


    /**
     * 
     * @param peerid 
     */
    public RemoveConnection(peerid : string){
        this._voiceChatMemberList = this._voiceChatMemberList.filter((p) => p.peerid !== peerid);
        this.SendMemberList();
    }

}