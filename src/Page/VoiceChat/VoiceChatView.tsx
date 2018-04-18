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
import VoiceChatSettingDialog from './VoiceChatSettingDialog';
import { DeviceView } from '../DeviceView/DeviceVew';
import VoiceChatMemberSender from '../../Contents/Sender/VoiceChatMemberSender';
import VoiceChatMemberListSender from '../../Contents/Sender/VoiceChatMemberListSender';


export default class VoiceChatView extends AbstractServiceView<VoiceChatController> {

    private _voiceChat = document.getElementById('sbj-voicechat') as HTMLInputElement;
    private _voiceChatOn = document.getElementById('sbj-voicechat-on');
    private _voiceChatOff = document.getElementById('sbj-voicechat-off');

    private _voiceMicSettings = document.getElementById('sbj-voicechat-settings');
    private _voiceMic = document.getElementById('sbj-voicechatmic') as HTMLInputElement;
    private _voiceMicOn = document.getElementById('sbj-voicechatmic-on');
    private _voiceMicOff = document.getElementById('sbj-voicechatmic-off');

    private _isVoiceChat: boolean;
    private _isMicMute: boolean = true;
    private _voiceChatStream: MediaStream;
    private _audioDevice: string;


    /**
     * 
     */
    protected Initialize(callback: OnViewLoad) {

        this._voiceChat.onclick = (e) => {
            this.ChangeVoiceChat();
        }

        this._voiceMicSettings.onclick = (e) => {
            VoiceChatSettingDialog.Show();
        }

        this._voiceMic.onclick = (e) => {
            this.IsMicMute = !this.IsMicMute;
        }

        this._isMicMute = true;
        this._voiceMic.hidden = true;
        this.SetMediaDevice();

        callback();
    }



    /**
     * ボイスチャットの開始
     */
    private ChangeVoiceChat() {
        this._isVoiceChat = !this._isVoiceChat;
        this._voiceChatOn.hidden = !this._isVoiceChat;
        this._voiceChatOff.hidden = this._isVoiceChat;
        this._voiceMic.hidden = !this._isVoiceChat;
        this._voiceMicSettings.hidden = this._isVoiceChat;

        if (this._isVoiceChat) {
            this._voiceChat.classList.remove("mdl-button--colored");
            this._voiceChat.classList.add("mdl-button--accent");

            let msc = StreamUtil.GetMediaStreamConstraints(null, this._audioDevice);

            StreamUtil.GetStreaming(msc, (stream) => {
                this._voiceChatStream = stream;
                this.IsMicMute = true;
                let peer = this.Controller.SwPeer;
                let ownerid = this.Controller.SwPeer.OwnerPeerId;
                this.Controller.SwRoom = new SWRoom(this.Controller, ownerid, SWRoomMode.SFU, stream);
            }, (errname) => {
                alert(errname);
            });

        }
        else {
            this._voiceChat.classList.remove("mdl-button--accent");
            this._voiceChat.classList.add("mdl-button--colored");
            this.Controller.SwRoom.Close();
            this.IsMicMute = true;
        }

        let sender = new VoiceChatMemberSender();
        sender.peerid = this.Controller.SwPeer.PeerId;

        //  sender.aid = this._controller.CurrentActor.aid;
        //  sender.iid = this._controller.CurrentActor.dispIid;
        sender.isMember = this._isVoiceChat;

        this.Controller.SwPeer.SendToOwner(sender);
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
        this._voiceMicOn.hidden = value;
        this._voiceMicOff.hidden = !value;
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
        //  人数表示
    }


    /**
     * Audioソースの取得とリストへのセット
     */
    public SetMediaDevice() {

        let preMic = LocalCache.VoiceChatOptions.SelectMic;
        let isInit = (!preMic);

        DeviceUtil.GetAudioDevice((devices) => {

            let textElement = document.getElementById('mic-select') as HTMLInputElement;
            var listElement = document.getElementById('mic-list') as HTMLElement;

            var view = new DeviceView(DeviceKind.Audio, textElement, listElement, devices, (deviceId, deviceName) => {
                this._audioDevice = deviceId;
                LocalCache.SetVoiceChatOptions((opt) => opt.SelectMic = deviceId);
                this.ChnageDevice();
            });

            if (isInit) {
                view.SelectFirstDevice();
            } else {
                view.SelectDeivce(preMic);
            }

            document.getElementById("mic-select-div").classList.add("is-dirty");
            this.ChnageDevice();
        });

    }


    /**
     * デバイス変更時処理
     */
    public ChnageDevice() {
        let options = LocalCache.VoiceChatOptions;
        this._voiceChat.disabled = !(options.SelectMic ? true : false);
    }


}
