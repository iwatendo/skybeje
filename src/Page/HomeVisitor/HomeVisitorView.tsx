import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Home from "../../Base/IndexedDB/Home";
import { Icon } from "../../Base/IndexedDB/Personal";
import * as Timeline from "../../Base/IndexedDB/Timeline";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import ImageUtil from "../../Base/Util/ImageUtil";
import ImageInfo from "../../Base/Container/ImageInfo";

import * as HomeContainer from "../HomeInstance/HomeInstanceContainer";
import { RoomActorMemberSender } from "../HomeInstance/HomeInstanceContainer";
import * as HIContainer from "../HomeInstance/HomeInstanceContainer";
import * as CIContainer from "../CastInstance/CastInstanceContainer";
import DisConnectComponent from "./DisConnect/DisConnectComponent";
import { TimelineComponent } from "./Timeline/TimelineComponent";
import { GetTimelineSender } from "./HomeVisitorContainer";
import HomeVisitorController from "./HomeVisitorController";
import RoomMemberComponent from "./RoomMember/RoomMemberComponent";
import CastSelectorController from "./CastSelector/CastSelectorController";
import InputPaneController from "./InputPane/InputPaneController";


export default class HomeVisitorView extends AbstractServiceView<HomeVisitorController> {

    private _boot: boolean = true;
    private _element = document.getElementById('sbj-home-visitor');
    private _splitElement = document.getElementById('sbj-home-visitor-split');
    private _timelineElement = document.getElementById('sbj-home-visitor-timeline-component');
    private _head = document.getElementById('sbj-home-visitor-header');
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
        //  ライブキャストは前回分が残らないようにクリア
        this.Controller.NotifyLivecast("");

        this.SetSplitPane();
        this.CastSelector = new CastSelectorController(this.Controller);

        window.onresize = (e) => {
            this.DoResize();
        };

        document.getElementById('sbj-home-visitor-timeline-component').onscroll = (e) => {
            this.OnTimelineScroll();
        };

        //  「退室」処理
        document.getElementById('sbj-home-visitor-stop').onclick = (e) => {
            this.Controller.NotifyDashbord('');
        };

        //  接続時のタイムアウト処理
        window.setTimeout(() => {
            if (!this.Controller.HasError) {
                if (document.getElementById('sbj-home-visitor-multi-boot').hidden) {
                    //  接続ページの表示が10秒を経過した場合
                    //  接続できなかったと判断して、エラーメッセージを表示する
                    document.getElementById('sbj-home-visitor-connection-timeout').hidden = false;
                    this.Controller.HasError = true;
                }
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
        this.Controller.HasError = true;
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
     *  親インスタンスが閉じられた場合の処理
     *  切断された時の表示
     */
    public DisConnect() {

        if (!this.Controller.HasError) {
            ReactDOM.render(<DisConnectComponent controller={this.Controller} />, this._element, () => {
                this.Controller.NotifyLivecast("");
                this._splitElement.hidden = true;
                this._head.hidden = true;
                this._element.hidden = false;
            });
        }
    }


    /**
     * 部屋の表示
     * @param room 
     */
    public SetRoomInfo(room: Home.Room) {

        if (this._boot) {
            this._element.setAttribute("hidden", "true");
            this._head.removeAttribute("hidden");
            this._splitElement.removeAttribute("hidden");
            this.InputPane = new InputPaneController(this.Controller);
            this._boot = false;
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
        ImageInfo.SetCss("sbj-home-visitor-split", room.background);

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
        this.SetTimeline(new Array<Timeline.Message>());
    }


    /**
     * タイムラインの更新
     */
    public SetTimeline(tlms: Array<Timeline.Message>) {

        let controller = this.Controller;

        //  キャッシュ化
        controller.TimelineCache.SetMessages(tlms);

        //  タイムラインの描画処理
        controller.RoomCache.GetRoomByActorId(this.Controller.CurrentAid, (room) => {

            let dispTlmsgs = controller.TimelineCache.GetMessages(room.hid);

            let te = this._timelineElement;
            let isScrollMax = (te.scrollHeight <= (te.scrollTop + te.offsetHeight) + 72);

            ReactDOM.render(<TimelineComponent key={"timeline"} controller={this.Controller} messages={dispTlmsgs} />, this._timelineElement, () => {

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
        this.SetTimeline(new Array<Timeline.Message>());
    }


    /**
     * アイコン画像のCSS設定
     * @param icon 
     */
    public SetIconCss(icon: Icon) {

        if (!icon) {
            return;
        }

        let imgclassName = "sbj-icon-img-" + icon.iid.toString();
        document.getElementsByClassName(imgclassName);

        let elements = document.getElementsByClassName(imgclassName);

        for (let i in elements) {
            let element = elements[i] as HTMLElement;
            if (element.style) {
                ImageInfo.SetElementCss(element, icon.img);
            }
        }
    }

}
