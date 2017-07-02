
import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";

import WebRTCService from "../../Base/Common/WebRTCService";
import LocalCache from "../../Base/Common/LocalCache";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";

import HomeInstanceController from "./HomeInstanceController";
import { ClearTimelineSender } from "./HomeInstanceContainer";
import { RoomView } from "./Room/RoomView";


export default class HomeInstanceView extends AbstractServiceView<HomeInstanceController> {

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
            this.StartVisitor();
        };

        document.getElementById('sbj-clear-timeline').onclick = (e) => {
            this.ClearTimeline();
        };

        document.getElementById('sbj-dashborad-change-room').onclick = (e) => {

            this.Controller.Model.GetRooms((rooms) => {
                this.Controller.Room.ChangeRoomInfo(rooms);
            });
        }

        let peerid = LocalCache.BootHomeInstancePeerID;

        this.SetInviteUrl(peerid);
        this.NotifyDashbord(peerid);

        this.Controller.Model.GetEntrance((entrance) => {

            if (entrance) {
                let title = entrance.name;
                document.getElementById("sbj-home-instance-title").textContent = title;
            }

            this.Controller.Model.GetRooms((rooms) => {
                let element = document.getElementById("sbj-home-instance-rooms");
                this.Controller.Room = new RoomView(this.Controller, element, rooms);
                callback();
            });

        });

    }


    /**
     * 接続URLの表示
     * @param peerid ホームインスタンスのPeerID
     */
    public SetInviteUrl(peerid: string) {
        let url: string = LinkUtil.CreateLink("../Dashboard/", peerid);
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
    public StartVisitor() {

        let element = window.parent.document.getElementById('sbj-main-home-visitor-start');

        if (element) {
            element.textContent = LinkUtil.GetArgs('hid');
            element.click();
        }

    }


    /**
     * タイムラインのクリア処理
     */
    public ClearTimeline() {
        this.Controller.Model.ClearTimeline(() => {
            this.Controller.Manager.Chat.AllClear();
            WebRTCService.ChildSendAll(new ClearTimelineSender());
        });
    }

}
