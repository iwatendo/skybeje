import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import * as Timeline from "../../../Base/IndexedDB/Timeline";

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import LocalCache from "../../../Base/Common/LocalCache";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import HomeVisitorController from "../HomeVisitorController";
import { ChatMessageSender } from "../HomeVisitorContainer";
import RoomComponent, { RoomUnread } from "./RoomComponent";


export default class InputPaneController {

    private _inputpaneElement = document.getElementById('sbj-home-visitor-inputpane');
    private _actorNameElement = document.getElementById('sbj-inputpanel-actor-name');
    private _actorIconElement = document.getElementById('sbj-inputpanel-actor-icon');
    private _textareaElement = document.getElementById('sbj-inputpanel-text') as HTMLInputElement;
    private _actorEditButton = document.getElementById('sbj-inputpanel-actor-edit-button');
    private _selectActorButton = document.getElementById('sbj-inputpanel-select-actor-button');
    private _sendMessageButton = document.getElementById('sbj-inputpanel-send-message-button');

    private _unreadElement = document.getElementById('sbj-unread-count');
    private _otherRoomList = document.getElementById('sbj-inputpanel-other-room-list');
    private _otherRoomButton = document.getElementById('sbj-inputpanel-other-room-button');
    private _otherRoomCount = document.getElementById('sbj-inputpanel-noread-other-room-count');

    private _dashboradChangeActorElement = document.getElementById('sbj-dashborad-change-actor') as HTMLInputElement;
    private _dashboradSelectActorElement = document.getElementById('sbj-dashborad-select-actor') as HTMLInputElement;

    private _profileDoCloseElement = document.getElementById('sbj-profile-do-close') as HTMLInputElement;

    private _profileFrame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;


    private _controller: HomeVisitorController;
    private _unreadMap: Map<string, number>;
    private _lastTlmCtime: number;


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._controller = controller;
        this._unreadMap = new Map<string, number>();
        this._lastTlmCtime = 0;

        document.onkeyup = this.OnOtherKeyPress;

        //  イベント設定
        this._textareaElement.onkeydown = (e) => { this.OnKeyDown(e); };
        this._actorEditButton.onclick = (e) => { this.DoShowProfileEditDialog(); };
        this._actorIconElement.ondblclick = (e) => { this.DoShowProfileEditDialog(); };
        this._selectActorButton.onclick = (e) => { this.DoShowActorSelectPanel(); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        //  ダッシュボードからの変更通知
        this._dashboradChangeActorElement.onclick = (e) => {
            this._controller.ChagneActorInfo(this._dashboradChangeActorElement.value);
        }

        this._dashboradSelectActorElement.onclick = (e) => {
            this._profileFrame.hidden = true;
            let aid = this._dashboradSelectActorElement.value
            this._controller.ChangeCurrentActor(aid);
        }

        //  プロフィール画面からのダイアログクローズ通知
        this._profileDoCloseElement.onclick = (e) => {
            this._profileFrame.hidden = true;
            this.ChangeSelectionActorIcon(controller.CurrentAid); //   名称等の再描画の為にコール
            this._textareaElement.focus();
        }

        this._textareaElement.value = "";
        this.DisplayActor();
    }


    /**
     * 
     */
    public DisplayActor() {

        let actor = this._controller.CurrentActor;
        //  選択しているアクターの名称表示
        this._actorNameElement.textContent = (actor ? actor.name : "");

        //  アイコン表示
        let doDispIcon = (iconImg) => {
            ImageInfo.SetCss('sbj-inputpanel-actor-icon', iconImg);
            this._textareaElement.focus();
        }

        if (actor.dispIid) {
            this._controller.Model.GetIcon(actor.dispIid, (icon) => { doDispIcon(icon.img); });
        }
        else {
            doDispIcon(new ImageInfo())
        }
    }



    /**
     * テキストエリア以外でエンターキーが押された場合に、テキストエリアにフォーカスを設定を移す
     * @param e 
     */
    public OnOtherKeyPress(e: KeyboardEvent) {
        if (e.keyCode === 13) {
            document.getElementById('sbj-inputpanel-text').focus();
        }
    }


    /**
     * テキストエリアのキーイベント
     * @param e 
     */
    private OnKeyDown(e: KeyboardEvent) {

        //  エスケープキーは入力中の文字をクリアして終了
        if (e.keyCode === 27) {
            e.returnValue = false;
            this._textareaElement.value = "";
            return;
        }

        //  エンターキーは設定によって動作を変える
        if (e.keyCode === 13) {

            let isSend = false;

            //  CTRLキー押下時は、設定に関わらず送信
            if (e.ctrlKey) {
                isSend = true;
            }
            else {
                //  それ以外の場合は設定によって動作を変える
                isSend = (LocalCache.ChatEnterMode === 0);
                if (e.shiftKey || e.altKey) isSend = !isSend;
            }

            if (isSend) {
                e.preventDefault();
                if (this.IsInput()) {
                    //  入力がされている場合は送信する
                    this.SendInputMessage();
                }
            }
            return;
        }

        //  
        let isCtrlAltShift = e.ctrlKey || e.altKey || e.shiftKey;

        if (isCtrlAltShift) {

            if (LocalCache.ActorChangeKeyMode === 0) {
                if (!e.ctrlKey) return;
            }
            else {
                if (!e.altKey || !e.shiftKey) return;
            }

            switch (e.keyCode) {
                case 37: // [←]
                    this.MoveSelectionActor(-1);
                    e.preventDefault();
                    return;
                case 39: // [→]
                    this.MoveSelectionActor(1);
                    e.preventDefault();
                    return;
                case 38: // [↑]
                    this.MoveSelectionIcon(-1);
                    e.preventDefault();
                    return;
                case 40: // [↓]
                    this.MoveSelectionIcon(1);
                    e.preventDefault();
                    return;
            }
        }
    }


    /**
     * 入力されているか？
     */
    private IsInput(): boolean {
        let text = this._textareaElement.value;
        return (text.replace(/\s/g, "").length > 0);
    }


    /**
     * メッセージ送信
     * @param e 
     */
    private SendInputMessage() {

        let text = this._textareaElement.value;

        if (text && text.length > 0) {

            let chatMessage = new ChatMessageSender();
            let actor = this._controller.CurrentActor;
            chatMessage.peerid = this._controller.PeerId;
            chatMessage.aid = actor.aid;
            chatMessage.name = actor.name;
            chatMessage.iid = actor.dispIid;
            chatMessage.text = text;
            this._controller.SendChatMessage(chatMessage);

            this._textareaElement.value = "";
        }
    }


    /**
     * アクター選択パネルの表示
     */
    private DoShowActorSelectPanel() {

        let controller = this._controller;
        controller.NotifyShowProfile(controller.CurrentAid, true);
        this._profileFrame.src = "";
    }


    /**
     * プロフィール編集ダイアログの表示
     */
    private DoShowProfileEditDialog() {

        let controller = this._controller;
        let useActors = controller.UseActors;
        let aid = controller.CurrentAid;

        let src = LinkUtil.CreateLink("../Profile/") + "?aid=" + aid;

        this._profileFrame.src = null;
        this._profileFrame.onload = () => {
            this._profileFrame.hidden = false;
            this._profileFrame.onload = null;
            this._profileFrame.contentDocument.getElementById('sbj-profile-cancel').focus();
        }
        this._profileFrame.src = src;
    }


    /**
     * ショートカットキーでのアクター変更
     * @param value 
     */
    private MoveSelectionActor(value: number) {

        let useActors = this._controller.UseActors;
        let actorCount = useActors.length;
        let selActor = this._controller.CurrentAid;

        let sel = -1;
        let pos = 0;

        useActors.map((ap) => {
            if (ap.aid === this._controller.CurrentAid) sel = pos;
            pos++;
        });

        if (sel >= 0) {
            sel = (sel + value + actorCount) % actorCount;
            this.ChangeSelectionActorIcon(useActors[sel].aid);
        }

    }


    /**
     * 
     * @param aid 
     */
    public ChangeSelectionActorIcon(aid: string) {

        this._controller.ChangeCurrentActor(aid);

        //  アクター情報を取得
        this._controller.Model.GetActor(aid, (actor) => {

            let iid = actor.dispIid;
            if (iid === "" && actor.iconIds.length > 0) {
                iid = actor.iconIds[0];
            }

            this._controller.View.MoveLastTimeline();
        });
    }


    /**
     * 選択アイコンの変更
     * @param iid 
     */
    public ChangeSelectionIcon(iid: string) {
        let controller = this._controller;
        let aid = controller.CurrentAid
        controller.View.CastSelector.NotifyServantToActor();
        this.DisplayActor();
    }


    /**
     * 選択アイコンのショートカットでの変更
     * @param value 
     */
    private MoveSelectionIcon(value: number) {

        let actor = this._controller.CurrentActor;

        if (actor.iconIds.length === 0) {
            return;
        }

        let sel = actor.iconIds.indexOf(actor.dispIid);
        if (sel >= 0) {
            let iconCount = actor.iconIds.length;

            sel = (sel + value + iconCount) % iconCount;
            actor.dispIid = actor.iconIds[sel];

            this._controller.Model.UpdateActor(actor, () => {
                this.ChangeSelectionIcon(actor.dispIid);
            });
        }

    }


    /**
     * 未読メッセージ数の表示
     * @param tlms 
     */
    public SetUnreadCount(tlms: Array<Timeline.Message>) {

        if (!tlms) {
            return;
        }

        let map = this._unreadMap;
        tlms.forEach((tlm) => {

            if (this._lastTlmCtime < tlm.ctime) {
                //  新規発言データのみを対象とする（訂正データは対象外）
                if (tlm.ctime === tlm.utime) {
                    let hid = tlm.hid;
                    let count = (map.has(hid) ? map.get(hid) + 1 : 1);
                    map.set(hid, count);
                    this._lastTlmCtime = tlm.ctime;
                }
            }
        });
    }


    /**
     * 
     */
    public ClearUnreadCount() {
        this._unreadMap.set(this._controller.CurrentHid, 0);
    }


    /**
     * 
     */
    public DisplayUnreadCount() {

        let list = new Array<RoomUnread>();
        let totalCount = 0;

        let rooms = this._controller.RoomCache.GetRooms();

        rooms.forEach((room) => {
            let hid = room.hid;
            let count = 0;
            if (this._unreadMap.has(hid)) {
                count = this._unreadMap.get(hid);
            }

            list.push(new RoomUnread(room, count));
            totalCount += count;
        });

        let disp = this.ToDispCount(totalCount);

        if (disp.length === 0) {
            this._otherRoomCount.removeAttribute('data-badge');
        }
        else {
            this._otherRoomCount.setAttribute("data-badge", disp);
        }

        let key = StdUtil.CreateUuid();
        ReactDOM.render(<RoomComponent key={key} controller={this._controller} roomUnreads={list} />, this._otherRoomList);
    }


    /**
     * 表示用の件数
     * @param value 
     */
    private ToDispCount(value: number): string {
        if (!value) return "";
        if (value === 0) return "";
        if (value > 99) return "99+";
        return value.toString();
    }


}