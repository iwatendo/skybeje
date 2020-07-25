import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from '../../Base/Util/LinkUtil';

import StreamUtil, { MobileCam } from '../../Base/Util/StreamUtil';
import SWRoom, { SWRoomMode } from '../../Base/WebRTC/SWRoom';

import LocalCache from '../../Contents/Cache/LocalCache';

import VoiceChatController from "./VoiceChatController";
import VoiceChatMemberSender from '../../Contents/Sender/VoiceChatMemberSender';
import VoiceChatMemberListSender from '../../Contents/Sender/VoiceChatMemberListSender';
import MdlUtil from '../../Contents/Util/MdlUtil';


export default class VoiceChatView extends AbstractServiceView<VoiceChatController> {

    private _isVoiceChat: boolean;
    private _isMicMute: boolean;
    private _isSpeakerMute: boolean;
    private _voiceChatStream: MediaStream;

    private _audioMediaStream: MediaStream;

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

        let micButton = document.getElementById('sbj-voicechat-mic') as HTMLInputElement;
        let speakerButton = document.getElementById('sbj-voicechat-speaker') as HTMLInputElement;

        micButton.onclick = (e) => {
            this.MuteButtonDisabled = true;
            this.IsMicMute = !this.IsMicMute;
            this.MuteButtonDisabled = false;
        }

        speakerButton.onclick = (e) => {
            this.IsSpeakerMute = !this.IsSpeakerMute;
        }

        this._isMicMute = false;
        this._isSpeakerMute = true;

        callback();
    }


    /**
     * 
     */
    public set JoinButtonDisabled(value: boolean) {
        (document.getElementById('sbj-voicechat') as HTMLInputElement).disabled = value;
    }

    public set MuteButtonDisabled(value: boolean) {
        (document.getElementById('sbj-voicechat-mic') as HTMLInputElement).disabled = value;
    }


    /**
     * ボイスチャットの開始
     */
    private ChangeVoiceChat() {

        let videoElement = document.getElementById('sbj-video') as HTMLVideoElement;
        let voiceChatElement = document.getElementById('sbj-voicechat') as HTMLInputElement;
        let voiceChatOnElement = document.getElementById('sbj-voicechat-on');
        let voiceChatOffElement = document.getElementById('sbj-voicechat-off');
        let voiceMicElement = document.getElementById('sbj-voicechat-mic') as HTMLInputElement;
        let voiceSpeakerElement = document.getElementById('sbj-voicechat-speaker') as HTMLInputElement;
        let voiceMicSettingsElement = document.getElementById('sbj-voicechat-settings');

        this._isVoiceChat = !this._isVoiceChat;
        voiceChatOnElement.hidden = !this._isVoiceChat;
        voiceChatOffElement.hidden = this._isVoiceChat;
        voiceMicElement.hidden = !this._isVoiceChat;
        voiceSpeakerElement.hidden = !this._isVoiceChat;

        if (this._isVoiceChat) {

            voiceChatElement.classList.remove("mdl-button--colored");
            voiceChatElement.classList.add("mdl-button--accent");

            let msc = this.GetMyDeviceMediaStream();

            StreamUtil.GetStreaming(msc, (stream) => {
                this._voiceChatStream = stream;
                this.IsMicMute = false;
                //  モバイル端末の場合はミュート状態で起動
                this.IsSpeakerMute = StdUtil.IsMobile();
                let peer = this.Controller.SwPeer;
                let ownerid = this.Controller.SwPeer.OwnerReomteId;

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
            this.IsSpeakerMute = true;
        }

        this.SendVoiceChatInfo();
        this.RefreshAudio();
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
        sender.isSFU = this.UseSFU();
        this.Controller.SwPeer.SendToOwner(sender);
    }


    /**
     * 自身の音声ストリームの取得
     */
    public GetMyDeviceMediaStream(): MediaStreamConstraints {

        if (StdUtil.IsMobile()) {
            return StreamUtil.GetMediaStreamConstraints_Mobile(MobileCam.NONE, true);
        }
        else {
            return StreamUtil.GetMediaStreamConstraints(null, LocalCache.VoiceChatOptions.SelectMic);
        }

        //  return StreamUtil.GetMediaStreamConstraints_DefaultDevice();
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
        document.getElementById('sbj-voicechat-mic-on').hidden = value;
        document.getElementById('sbj-voicechat-mic-off').hidden = !value;
        MdlUtil.SetColered('sbj-voicechat-mic', !value);
        StreamUtil.SetMute(this._voiceChatStream, value);
    }


    /**
     * スピーカーのミュート設定
     */
    private get IsSpeakerMute(): boolean {
        return this._isSpeakerMute;
    }


    /**
     * スピーカーのミュート設定
     */
    private set IsSpeakerMute(value) {
        this._isSpeakerMute = value;
        document.getElementById('sbj-voicechat-speaker-on').hidden = value;
        document.getElementById('sbj-voicechat-speaker-off').hidden = !value;
        MdlUtil.SetColered('sbj-voicechat-speaker', !value);
        this.RefreshAudio();
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


    /*-----------------------------------------------------------
     * 通話相手の音声ストリーム処理
     *----------------------------------------------------------*/


    /**
     * 
     * @param stream 
     */
    private GetAudioTrack(stream: MediaStream): MediaStreamTrack {

        let result: MediaStreamTrack;

        stream.getTracks().forEach(track => {
            if (track.kind === "audio") {
                result = track;
            }
        });

        return result;
    }


    /**
     * AudioTrackの追加
     * @param peerid 
     */
    public AddAudioTrack(stream: MediaStream): MediaStreamTrack {

        let element = document.getElementById('sbj-video') as HTMLVideoElement;

        let track = this.GetAudioTrack(stream);

        if (this._audioMediaStream) {

            this._audioMediaStream.addTrack(track);
        }
        else {
            let tracks = new Array<MediaStreamTrack>();
            tracks.push(track);
            this._audioMediaStream = new MediaStream(tracks);
        }

        return track;
    }


    /**
     * 指定AudioTrackの削除
     * @param track 
     */
    public RemoveAudioTrack(track: MediaStreamTrack) {
        let element = document.getElementById('sbj-video') as HTMLVideoElement;
        if (element.srcObject) {
            (element.srcObject as MediaStream).removeTrack(track);
        }
    }


    /**
     * ボイスチャット参加メンバーからの音声の再生のリフレッシュ
     */
    public RefreshAudio() {
        let element = document.getElementById('sbj-video') as HTMLVideoElement;
        element.oncanplay = (e) => { element.play(); }

        element.srcObject = this._audioMediaStream;
        element.muted = this.IsSpeakerMute;
        StreamUtil.SetMute(this._audioMediaStream, this.IsSpeakerMute);
    }

}
