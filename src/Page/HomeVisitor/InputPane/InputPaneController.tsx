import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Personal from "../../../Base/IndexedDB/Personal";
import * as Timeline from "../../../Base/IndexedDB/Timeline";

import StdUtil from "../../../Base/Util/StdUtil";
import LinkUtil from "../../../Base/Util/LinkUtil";
import LocalCache from "../../../Base/Common/LocalCache";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { DialogMode } from "../../../Base/Common/AbstractDialogController";

import ActorSelectorDialog from "../ActorSelector/ActorSelectorDialog";
import HomeVisitorController from "../HomeVisitorController";
import { ChatMessageSender } from "../HomeVisitorContainer";
import RoomComponent, { RoomUnread } from "./RoomComponent";
import ProfileEditerDialog from "../ProfileEditer/ProfileEditerDialog";


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
    private _profileSelectionIconElement = document.getElementById('sbj-profile-selection-icon') as HTMLInputElement;
    private _profileDoCloseElement = document.getElementById('sbj-profile-do-close') as HTMLInputElement;

    private _profileFrame = document.getElementById('sbj-profile-frame') as HTMLFrameElement;


    private _controller: HomeVisitorController;
    private _unreadMap: Map<string, number>;
    private _selectionIidMap: Map<string, string>;

    public SelectionActor: Personal.Actor;

    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {
        this._controller = controller;
        this._unreadMap = new Map<string, number>();
        this._selectionIidMap = new Map<string, string>();

        document.onkeyup = this.OnOtherKeyPress;

        //  イベント設定
        this._textareaElement.onkeydown = (e) => { this.OnKeyDown(e); };
        this._actorEditButton.onclick = (e) => { this.DoShoActorEditDialog(); };
        this._actorIconElement.ondblclick = (e) => { this.DoShoActorEditDialog(); };
        this._selectActorButton.onclick = (e) => { this.DoShowActorSelectDialog(); };
        this._sendMessageButton.onclick = (e) => { this.SendInputMessage(); };

        //  ダッシュボードからの変更通知
        this._dashboradChangeActorElement.onclick = (e) => {
            this._controller.ChagneActorInfo(this._dashboradChangeActorElement.value);
            this.ChangeActor();
        }

        //  プロフィール画面からのアイコン変更通知
        this._profileSelectionIconElement.onclick = (e) => {
            let iid = this._profileSelectionIconElement.value;
            this.ChangeSelectionIcon(iid);
        };

        //  プロフィール画面からのダイアログクローズ通知
        this._profileDoCloseElement.onclick = (e) => {
            this._profileFrame.hidden = true;
            this.ChangeSelectionActorIcon(controller.UseActor.CurrentAid); //   名称等の再描画の為にコール
            this._textareaElement.focus();
        }

        this._textareaElement.value = "";
        this.ChangeActor();
    }


    /**
     * 
     * @param aid 
     */
    public GetSelectionIid(aid: string) {
        if (this._selectionIidMap.has(aid)) {
            return this._selectionIidMap.get(aid);
        }
        else {
            return "";
        }
    }


    /**
     * アクター毎に選択アイコンを保持しておく
     * @param aid 
     * @param iid 
     */
    public SetSelectionIid(aid: string, iid: string) {
        return this._selectionIidMap.set(aid, iid);
    }


    /**
     * 
     */
    private DisplayActor() {

        //  選択しているアクターの名称表示
        this._actorNameElement.textContent = (this.SelectionActor ? this.SelectionActor.name : "");

        //  アイコン表示
        this._controller.Model.GetIcon(this.GetSelectionIid(this.SelectionActor.aid), (icon) => {
            let img = (icon ? icon.img : new ImageInfo());
            ImageInfo.SetCss('sbj-inputpanel-actor-icon', img);
        });
    }

    /**
     * アクター変更時イベント
     */
    public ChangeActor() {

        this._controller.Model.GetActor(this._controller.UseActor.CurrentAid, (actor) => {
            this.SelectionActor = actor;

            let iid = this.GetSelectionIid(actor.aid);
            if (!iid) {
                iid = (actor.iconIds.length > 0 ? actor.iconIds[0] : "");
            }

            this.SetSelectionIid(actor.aid, iid);
            this.DisplayActor();
        });
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
                case 77: // [M]
                    this.DoShowActorSelectDialog();
                    e.preventDefault();
                    return;
                case 73: // [I]
                    this.DoShoActorEditDialog();
                    e.preventDefault();
                    return;
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
            chatMessage.peerid = this._controller.PeerId;
            chatMessage.aid = this.SelectionActor.aid;
            chatMessage.name = this.SelectionActor.name;
            chatMessage.iid = this.GetSelectionIid(this.SelectionActor.aid);
            chatMessage.text = text;
            this._controller.SendChatMessage(chatMessage);

            this._textareaElement.value = "";
        }
    }


    /**
     * アクター選択ボタン押下時処理
     */
    private DoShowActorSelectDialog() {

        let controller = this._controller;
        let useActor = controller.UseActor;
        let dialog = new ActorSelectorDialog(controller);

        //  アクター選択ダイアログの表示
        dialog.Show(DialogMode.Select, useActor, (result) => {

            if (!result) {
                return;
            }

            controller.SetUseActor(result);
            let aid = controller.UseActor.CurrentAid;
            this.ChangeSelectionActorIcon(aid);

        });
    }

    /**
     * 
     */
    private DoShoActorEditDialog() {

        let controller = this._controller;
        let useActor = controller.UseActor;
        let aid = controller.UseActor.CurrentAid;

        let src = LinkUtil.CreateLink("../Profile/") + "?aid=" + aid;

        if (this._profileFrame.src != src) {
            this._profileFrame.src = src;
        }
        else {
            //  選択しているアイコンをセット
            this._profileSelectionIconElement.value = controller.UseActor.CurrentIid;
        }

        this._profileFrame.hidden = false;
    }


    /**
     * ショートカットキーでのアクター変更
     * @param value 
     */
    private MoveSelectionActor(value: number) {

        let useActor = this._controller.UseActor;
        let actorCount = useActor.ActorPeers.length;
        let selActor = useActor.CurrentAid;

        let sel = -1;
        let pos = 0;

        useActor.ActorPeers.map((ap) => {
            if (ap.actor.aid === useActor.CurrentAid) sel = pos;
            pos++;
        });

        if (sel >= 0) {
            sel = (sel + value + actorCount) % actorCount;
            this.ChangeSelectionActorIcon(useActor.ActorPeers[sel].actor.aid);
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

            let iid = this.GetSelectionIid(aid);
            if (iid === "" && actor.iconIds.length > 0) {
                iid = actor.iconIds[0];
            }
            this.SelectionActor = actor;
            this.ChangeSelectionIcon(iid);

            this._controller.View.MoveLastTimeline();
        });
    }


    /**
     * 選択アイコンの変更
     * @param iid 
     */
    public ChangeSelectionIcon(iid: string) {
        let controller = this._controller;
        let aid = controller.UseActor.CurrentAid
        controller.UseActor.CurrentIid = iid;
        controller.View.CastSelector.NotifyServantToActor();
        this.SetSelectionIid(aid, iid);
        this.DisplayActor();
    }


    /**
     * 選択アイコンのショートカットでの変更
     * @param value 
     */
    private MoveSelectionIcon(value: number) {

        let controller = this._controller;

        //  アクター情報を取得
        controller.Model.GetActor(controller.UseActor.CurrentAid, (actor) => {

            if (actor.iconIds.length === 0) {
                return;
            }

            let sel = actor.iconIds.indexOf(controller.UseActor.CurrentIid);
            if (sel >= 0) {
                let iconCount = actor.iconIds.length;

                sel = (sel + value + iconCount) % iconCount;
                let iid = actor.iconIds[sel];
                this.ChangeSelectionIcon(iid);
            }

        });

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

            //  新規発言データのみを対象とする。
            //  訂正データは未読対象外とする。
            if (tlm.ctime === tlm.utime) {
                let hid = tlm.hid;
                let count = (map.has(hid) ? map.get(hid) + 1 : 1);
                map.set(hid, count);
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