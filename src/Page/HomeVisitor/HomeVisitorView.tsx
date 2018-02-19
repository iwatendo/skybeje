import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../Contents/IndexedDB/Home";
import { Icon } from "../../Contents/IndexedDB/Personal";
import * as Timeline from "../../Contents/IndexedDB/Timeline";

import AbstractServiceView, { OnViewLoad } from "../../Base/AbstractServiceView";
import StdUtil from "../../Base/Util/StdUtil";
import ImageUtil from "../../Base/Util/ImageUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import { TimelineComponent } from "./Timeline/TimelineComponent";
import HomeVisitorController from "./HomeVisitorController";
import RoomMemberComponent from "./RoomMember/RoomMemberComponent";
import CastSelectorController from "./CastSelector/CastSelectorController";
import InputPaneController from "./InputPane/InputPaneController";
import LinkUtil from '../../Base/Util/LinkUtil';
import ChatInfoSender from '../../Contents/Sender/ChatInfoSender';


export default class HomeVisitorView extends AbstractServiceView<HomeVisitorController> {

    private _isBooting: boolean = true;
    private _bootElement = document.getElementById('sbj-home-visitor');
    private _mainElement = document.getElementById('sbj-home-visitor-main');
    private _disconnectElement = document.getElementById('sbj-home-visitor-disconnect');
    private _timelineElement = document.getElementById('sbj-home-visitor-timeline-component');
    private _headElement = document.getElementById('sbj-home-visitor-header');
    private _headTitleElement = document.getElementById('sbj-home-visitor-title');
    private _headTitleAccountCountElement = document.getElementById('sbj-home-visitor-account-count');
    private _headRoomMemberElement = document.getElementById('sbj-home-visitor-room-member');

    public CastSelector: CastSelectorController;

    public InputPane: InputPaneController;

    /**
     * 
     */
    protected Initialize(callback: OnViewLoad) {

        //  ダッシュボードに通知
        this.Controller.NotifyDashbord(this.Controller.PeerId);
        //  ライブキャストは前回分が残らないようにクリア通知
        this.Controller.NotifyClearLiveCast();

        this.SetSplitPane();
        this.CastSelector = new CastSelectorController(this.Controller);

        window.onresize = (e) => {
            this.DoResize();
        };

        document.getElementById('sbj-home-visitor-timeline-component').onscroll = (e) => {
            this.OnTimelineScroll();
        };

        //  「招待URLのコピー」
        let clipcopybtn = document.getElementById('sbj-home-visitor-linkcopy') as HTMLInputElement;
        clipcopybtn.onclick = (e) => {
            let linkurl = LinkUtil.CreateLink("../", LinkUtil.GetPeerID());
            StdUtil.ClipBoardCopy(linkurl);
            clipcopybtn.textContent = " 招待URLをクリップボードにコピーしました ";
            clipcopybtn.classList.remove('mdl-button--colored');
            clipcopybtn.classList.add('mdl-button--raised');
            clipcopybtn.disabled = true;
            window.setTimeout(() => {
                clipcopybtn.textContent = " 招待URLのコピー ";
                clipcopybtn.classList.add('mdl-button--colored');
                clipcopybtn.classList.remove('mdl-button--raised');
                clipcopybtn.disabled = false;
            }, 3000);
        };

        //  「退室」処理
        document.getElementById('sbj-home-visitor-stop').onclick = (e) => {
            this.Controller.NotifyDashbord('');
        };

        //  切断時の「退室」ボタン
        document.getElementById('sbj-home-visitor-disconnect-exit').onclick = (e) => {
            this.Controller.NotifyDashbord('');
        };

        //  切断時の「再接続」ボタン
        document.getElementById('sbj-home-visitor-disconnect-retry').onclick = (e) => {
            location.reload();
        };

        //  接続時のタイムアウト処理
        window.setTimeout(() => {
            if (this._isBooting) {
                //  接続ページの表示が10秒経過してもブート処理が完了していなかった場合
                //  接続できなかったと判断して、エラーメッセージを表示する
                document.getElementById('sbj-home-visitor-connection-timeout').hidden = false;
                this.Controller.HasError = true;
                this._isBooting = false;
            }
        }, 10000);

        //  
        callback();
    }


    /**
     * 多重起動エラー
     */
    public MutilBootError() {
        document.getElementById('sbj-home-visitor-connection-timeout').hidden = true;
        document.getElementById('sbj-home-visitor-multi-boot').hidden = false;
        this._isBooting = false;
    }


    /**
     * スプリットパネルの「仕切り」の移動をスムーズにさせる為の制御
     * ※移動中に他パネルにフォーカスが行かないように一時的InnerDivの幅を広げる
     */
    public SetSplitPane() {
        //  スプリットパネルのスライド時に
        //  他フレームにフォーカスが当たらないようにする
        let splitDivider = document.getElementById('sbj-home-visitor-divider');
        splitDivider.onmousedown = (e) => {
            let elements = document.getElementsByClassName("split-pane-divider-inner");
            if (elements.item.length > 0) {
                let ele = elements.item(0) as HTMLElement;
                ele.style.width = "2048px";
                ele.style.left = "-1048px";
            }
        };

        splitDivider.onmouseup = (e) => {
            let elements = document.getElementsByClassName("split-pane-divider-inner");
            if (elements.item.length > 0) {
                let ele = elements.item(0) as HTMLElement;
                ele.style.width = "10px";
                ele.style.left = "-5px";
            }
        };
    }


    /**
     *  親インスタンスが閉じられた場合やネットワークが切断した場合の処理
     */
    public DisConnect() {
        if (!this._isBooting && !this.Controller.HasError) {
            this.Controller.NotifyClearLiveCast();
            this._mainElement.hidden = true;
            this._headElement.hidden = true;
            this._bootElement.hidden = true;
            this._disconnectElement.hidden = false;
        }
    }


    /**
     * 部屋の表示
     * @param room 
     */
    public SetRoomInfo(room: Home.Room) {

        if (this._isBooting) {
            this._bootElement.hidden = true;
            this._headElement.hidden = false;
            this._mainElement.hidden = false;
            this.InputPane = new InputPaneController(this.Controller);
            this._isBooting = false;
        }

        if (this.Controller.CurrentHid === room.hid) {
            this.RefreshTimeline();
            this.SetRoomMember(room);
        }
        else {
            //  ルームの変更があった場合は
            //  変更先のルーム情報の取得と再描画
            this.Controller.CurrentHid = room.hid;
            this.SetRoomDisplay(room);
            this.Controller.GetTimeline(room.hid);
            this.SetRoomMember(room);
            this.CastSelector.ChangeRoom(room.hid);
        }
    }


    /**
     * 部屋の表示変更
     * @param room 
     */
    public SetRoomDisplay(room: Home.Room) {

        //  上部タイトル変更
        let title = room.name;
        this._headTitleElement.textContent = title;

        //  部屋の背景画像変更
        ImageInfo.SetCss("sbj-home-visitor-main", room.background);

        //  部屋情報の再描画
        this.InputPane.DisplayUnreadCount();
    }


    /**
     * 
     * @param room 
     */
    public SetRoomMember(room: Home.Room) {

        //  ルームメンバーの取得
        this.Controller.RoomCache.GetMember(room.hid, (ram) => {

            //  ルーム内の接続人数表示
            let peerList = new Array<string>();
            ram.members.forEach((ap) => peerList.push(ap.peerid));
            this._headTitleAccountCountElement.setAttribute("data-badge", StdUtil.Uniq(peerList).length.toString());

            //  メンバー詳細の設定
            let key = StdUtil.CreateUuid();
            ReactDOM.render(<RoomMemberComponent key={key} controller={this.Controller} roomActorMember={ram} />, this._headRoomMemberElement);
        });
    }


    /**
     * タイムラインの再描画
     */
    public RefreshTimeline() {
        this.SetTimeline(new Array<Timeline.Message>(), new Array<ChatInfoSender>());
    }


    /**
     * タイムラインの更新
     */
    public SetTimeline(tlms: Array<Timeline.Message>, ings: Array<ChatInfoSender>) {

        let controller = this.Controller;

        //  キャッシュ化
        controller.TimelineCache.SetMessages(tlms);

        //  タイムラインの描画処理
        controller.RoomCache.GetRoomByActorId(this.Controller.CurrentAid, (room) => {

            let dispTlmsgs = controller.TimelineCache.GetMessages(room.hid);

            let te = this._timelineElement;
            let isScrollMax = (te.scrollHeight <= (te.scrollTop + te.offsetHeight) + 72);

            ReactDOM.render(<TimelineComponent key={"timeline"} controller={this.Controller} messages={dispTlmsgs} inputs={ings} />, this._timelineElement, () => {

                controller.TimelineCache.SetTimelineIcon(dispTlmsgs);
                this.InputPane.SetUnreadCount(tlms);

                if (isScrollMax) {
                    this.MoveLastTimeline();
                }
                else {
                    this.InputPane.DisplayUnreadCount();
                }
            });
        });
    }


    /**
     * リサイズ時イベント
     */
    private DoResize() {
        this.MoveLastTimeline();
    }


    /**
     * タイムラインのスクロールイベント
     */
    public OnTimelineScroll() {
        let te = this._timelineElement;
        if (te.scrollHeight <= (te.scrollTop + te.offsetHeight)) {
            this.MoveLastTimeline();
        }
    }

    /**
     * タイムラインを最終行の位置に移動する
     */
    public MoveLastTimeline() {
        this._timelineElement.scrollTop = 4294967295;
        if (this.InputPane) {
            this.InputPane.ClearUnreadCount();
            this.InputPane.DisplayUnreadCount();
        }
    }


    /**
     * 
     */
    public ClearTimeline() {
        this.Controller.TimelineCache.Clear();
        this.SetTimeline(new Array<Timeline.Message>(), new Array<ChatInfoSender>());
    }


    /**
     * アイコン画像のCSS設定
     * @param icon 
     */
    public SetIconCss(icon: Icon) {

        if (!icon) {
            return;
        }

        //  チャットの文字色 / 背景色設定
        if (icon.msgcolor || icon.msgbackcolor) {
            let msgclassName = "sbj-balloon-" + icon.iid.toString();
            let elements = document.getElementsByClassName(msgclassName);

            for (let i in document.getElementsByClassName(msgclassName)) {
                let element = elements[i] as HTMLElement;
                if (element.style) {
                    if (icon.msgcolor) element.style.color = icon.msgcolor;
                    if (icon.msgbackcolor) element.style.backgroundColor = icon.msgbackcolor;
                }
            }
        }

        //  アイコン設定
        if (icon.img) {
            let imgclassName = "sbj-icon-img-" + icon.iid.toString();
            let elements = document.getElementsByClassName(imgclassName);

            for (let i in elements) {
                let element = elements[i] as HTMLElement;
                if (element.style) {
                    ImageInfo.SetElementCss(element, icon.img);
                }
            }
        }

    }

}
