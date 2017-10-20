
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";

import * as Home from "../../Base/IndexedDB/Home";

import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeInstanceController from "./HomeInstanceController";
import { ClearTimelineSender } from "./HomeInstanceContainer";
import { RoomView } from "./Room/RoomView";


export default class HomeInstanceView extends AbstractServiceView<HomeInstanceController> {

    private _roomFrame = document.getElementById('sbj-room-frame') as HTMLFrameElement;


    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {

        StdUtil.StopPropagation();

        document.getElementById('sbj-stop-instance').onclick = (e) => {
            this.NotifyDashbord("");
        };

        document.getElementById('sbj-start-visitor').onclick = (e) => {
            this.StartVisitor(false);
        };

        document.getElementById('sbj-start-visitor-tab').onclick = (e) => {
            this.StartVisitor(true);
        };


        document.getElementById('sbj-clear-timeline').onclick = (e) => {
            this.ClearTimeline();
        };

        document.getElementById('sbj-home-instance-room-add-button').onclick = (e) => {
            //  新規追加
            let hid = StdUtil.CreateUuid();
            this.DoShowRoomEditDialog(hid);
        }

        //  プロフィール画面からのダイアログクローズ通知
        document.getElementById('sbj-room-frame-close').onclick = (e) => {
            this._roomFrame.hidden = true;
            this.Controller.Model.GetRooms((rooms) => {
                this.Controller.Room.ChangeRoomInfo(rooms);
            });
        }

        let peerid = LocalCache.BootHomeInstancePeerID;

        //  this.SetInviteUrl(peerid);
        this.NotifyDashbord(peerid);

        this.Controller.Model.GetRooms((rooms) => {
            let element = document.getElementById("sbj-home-instance-rooms");
            this.Controller.Room = new RoomView(this.Controller, element, rooms);
            callback();
        });

    }


    /**
     * 接続URLの表示
     * @param peerid ホームインスタンスのPeerID
     */
    public SetInviteUrl(peerid: string) {
        let url: string = LinkUtil.CreateLink("../", peerid);
        let element: HTMLInputElement = document.getElementById('sbj-invite-url') as HTMLInputElement;
        element.value = url;
    }


    /**
     * 接続peer数の表示
     * @param count 
     */
    public SetPeerCount(count: number) {
        document.getElementById("sbj-home-instance-account-count").setAttribute("data-badge", count.toString());
    }


    /**
     * ホームインスタンスが起動した事を、ダッシュボードへ通知
     * @param peerid ホームインスタンスのPeerID
     */
    public NotifyDashbord(peerid: string) {
        let element = window.parent.document.getElementById('sbj-main-home-instance-id');

        if (element) {
            element.textContent = peerid;
            element.click();
        }
    }


    /**
     * 
     */
    public StartVisitor(isNewTab: boolean) {

        if (isNewTab) {
            let url = LinkUtil.CreateLink("../", LocalCache.BootHomeInstancePeerID);
            window.open(url, '_blank');
        } else {
            let element = window.parent.document.getElementById('sbj-main-home-visitor-start');
            if (element) {
                element.click();
            }
        }

    }


    /**
     * タイムラインのクリア処理
     */
    public ClearTimeline() {
        this.Controller.Model.ClearTimeline(() => {
            this.Controller.Manager.Chat.AllClear();
            WebRTCService.SendAll(new ClearTimelineSender());
        });
    }

    /**
     * プロフィール編集ダイアログの表示
     * @param hid 
     */
    public DoShowRoomEditDialog(hid: string) {

        let src = LinkUtil.CreateLink("../Room/") + "?hid=" + hid;

        this._roomFrame.src = null;
        this._roomFrame.onload = () => {
            this._roomFrame.hidden = false;
            this._roomFrame.onload = null;
            this._roomFrame.contentDocument.getElementById('sbj-room-cancel').focus();
        }
        this._roomFrame.src = src;
    }

}
