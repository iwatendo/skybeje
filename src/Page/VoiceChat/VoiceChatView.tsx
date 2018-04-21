import * as React from 'react';
import * as ReactDOM from 'react-dom';

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from '../../Base/Util/LinkUtil';

import { DialogMode } from "../../Contents/AbstractDialogController";
import SpeechUtil from "../../Base/Util/SpeechUtil";
import StreamUtil from '../../Base/Util/StreamUtil';
import SWRoom, { SWRoomMode } from '../../Base/WebRTC/SWRoom';
import DeviceUtil, { DeviceKind } from '../../Base/Util/DeviceUtil';

import LocalCache from '../../Contents/Cache/LocalCache';

import VoiceChatController from "./VoiceChatController";
import { DeviceView } from '../DeviceView/DeviceVew';
import VoiceChatMemberSender from '../../Contents/Sender/VoiceChatMemberSender';
import VoiceChatMemberListSender from '../../Contents/Sender/VoiceChatMemberListSender';


export default class VoiceChatView extends AbstractServiceView<VoiceChatController> {

    private _isVoiceChat: boolean;
    private _isMicMute: boolean = true;
    private _voiceChatStream: MediaStream;
    private _audioDevice: string;


    /**
     * 
     */
    protected Initialize(callback: OnViewLoad) {


        document.getElementById('sbj-voicechat').onclick = (e) => {
            this.JoinButtonDisabled = true;
            this.ChangeVoiceChat();
        }

        let settingsElement = document.getElementById('sbj-voicechat-settings');

        settingsElement.hidden = StdUtil.IsMobile();
        settingsElement.onclick = (e) => {
            let link = LinkUtil.CreateLink("../VoiceChatSettings/");
            window.open(link, "_blank");
        }

        let voiceMicElement = document.getElementById('sbj-voicechatmic') as HTMLInputElement;

        voiceMicElement.onclick = (e) => {
            this.MuteButtonDisabled = true;
            this.IsMicMute = !this.IsMicMute;
            this.MuteButtonDisabled = false;
        }

        voiceMicElement.hidden = true;

        this._isMicMute = true;

        callback();
    }


    /**
     * 
     */
    public set JoinButtonDisabled(value: boolean) {
        (document.getElementById('sbj-voicechat') as HTMLInputElement).disabled = value;
    }

    public set MuteButtonDisabled(value: boolean) {
        (document.getElementById('sbj-voicechatmic') as HTMLInputElement).disabled = value;
    }


    /**
     * ボイスチャットの開始
     */
    private ChangeVoiceChat() {

        let voiceChatElement = document.getElementById('sbj-voicechat') as HTMLInputElement;
        let voiceChatOnElement = document.getElementById('sbj-voicechat-on');
        let voiceChatOffElement = document.getElementById('sbj-voicechat-off');
        let voiceMicElement = document.getElementById('sbj-voicechatmic') as HTMLInputElement;
        let voiceMicSettingsElement = document.getElementById('sbj-voicechat-settings');

        this._isVoiceChat = !this._isVoiceChat;
        voiceChatOnElement.hidden = !this._isVoiceChat;
        voiceChatOffElement.hidden = this._isVoiceChat;
        voiceMicElement.hidden = !this._isVoiceChat;

        if (this._isVoiceChat) {
            voiceChatElement.classList.remove("mdl-button--colored");
            voiceChatElement.classList.add("mdl-button--accent");

            let msc = this.GetMediaStream();

            StreamUtil.GetStreaming(msc, (stream) => {
                this._voiceChatStream = stream;
                this.IsMicMute = true;
                let peer = this.Controller.SwPeer;
                let ownerid = this.Controller.SwPeer.OwnerPeerId;

                let mode = (this.UseSFU() ? SWRoomMode.SFU : SWRoomMode.Mesh);
                this.Controller.SwRoom = new SWRoom(this.Controller, ownerid, mode, stream);
            }, (errname) => {
                alert(errname);
            });

        }
        else {
            voiceChatElement.classList.remove("mdl-button--accent");
            voiceChatElement.classList.add("mdl-button--colored");
            this.Controller.SwRoom.Close();
            this.IsMicMute = true;
        }

        this.SendVoiceChatInfo();
    }


    /**
     * 
     */
    public SendVoiceChatInfo() {
        let sender = new VoiceChatMemberSender();
        sender.peerid = this.Controller.SwPeer.PeerId;
        sender.aid = "";
        sender.iid = "";
        sender.isMember = this._isVoiceChat;
        this.Controller.SwPeer.SendToOwner(sender);
    }


    /**
     * 
     */
    public GetMediaStream(): MediaStreamConstraints {
        // if (StdUtil.IsMobile()) {
        //     return StreamUtil.GetMediaStreamConstraints_Mobile(null, true);
        // }
        return StreamUtil.GetMediaStreamConstraints(null, LocalCache.VoiceChatOptions.SelectMic);
    }


    /** 
     * 
     */
    public UseSFU(): boolean {
        let arg = LinkUtil.GetArgs('sfu');
        if (arg === "1") return true;
        if (arg === "0") return false;
        //  オプション未指定時はSFU使用と判定する
        return true;
    }


    /**
     * マイクのミュート設定
     */
    private get IsMicMute(): boolean {
        return this._isMicMute;
    }


    /**
     * マイクのミュート設定
     */
    private set IsMicMute(value) {
        this._isMicMute = value;
        document.getElementById('sbj-voicechatmic-on').hidden = value;
        document.getElementById('sbj-voicechatmic-off').hidden = !value;
        StreamUtil.SetMute(this._voiceChatStream, value);
    }


    /**
     * 通話メンバーの変更通知（Streamの通知メンバー)
     * @param memberPeerList 
     */
    public ChangeVoiceChatStreamMember(memberPeerList: Array<string>) {
        //  こちら側はSFURoomにJoinしないと通知が来ない（通話状態じゃないと通知が来ない）為、現状未使用
        //  表示の不整合等が発生した場合の調査用として残します。
    }


    /**
     * 通話メンバーが変更された場合の処理
     * @param meberList 
     */
    public ChangeVoiceChatMember(meberList: VoiceChatMemberListSender) {

        let count: number = 0;

        meberList.Members.forEach(member => {
            if (member.isMember) {
                count++;
            }
        });

        //  参加人数表示の変更
        document.getElementById("sbj-voicechat-count").setAttribute("data-badge", count.toString());
    }

}
