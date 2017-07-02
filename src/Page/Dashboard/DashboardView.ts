
import LocalCache from "../../Base/Common/LocalCache";
import ImageInfo from "../../Base/Container/ImageInfo";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import { DialogMode } from "../../Base/Common/AbstractDialogController";

import DashboardController from "./DashboardController";
import { INaviContainer } from "./INaviContainer";

import NotImplementView from "./NotImplement/NotImplementView";
import ProfileView from "./UserProfile/ProfileView";
import ActorView from "./Actor/ActorView";
import EntranceView from "./Home/EntranceView";
import RoomView from "./Home/RoomView";
import HomeEditDialogController from "./Home/HomeEditDialog/HomeEditDialogController";
import SettingController from "./Setting/SettingController";
import BootInstanceView from "./BootInstance/BootInstanceView";


export enum NaviEnum {
    Profile = 1,
    Actor = 2,
    Home = 3,
    Room = 4,
    Item = 5,
    Friend = 6,
    Instance = 7,
    Visitor = 8,
    Setting = 9,
    LiveCast = 10,
}

enum DispEnum {
    Local = 0,
    HomeInstance = 1,
    HomeVisitor = 2,
    LiveCast = 3,
}


export default class DashboardView extends AbstractServiceView<DashboardController> {

    private _naviView: INaviContainer = null;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnViewLoad) {

        this.InitializeEvent();

        //  URLの指定IDを取得
        let peerid = LinkUtil.GetPeerID();

        if (peerid && peerid.length > 0) {

            //  招待URLからの接続時処理
            this.InviteLoginInitialize(peerid);
        }
        else {

            //  通常起動の場合はホームから開く
            this.DoNaviClick(NaviEnum.Instance);
        }

        callback();
    }


    /**
     * ナビ（メニュー）のエレメントマップ生成
     */
    private CreateNaviMap(): Map<NaviEnum, HTMLElement> {

        let result = new Map<NaviEnum, HTMLElement>();

        result.set(NaviEnum.Profile, document.getElementById('sbj-navi-profile'));
        result.set(NaviEnum.Actor, document.getElementById('sbj-navi-actor'));
        result.set(NaviEnum.Home, document.getElementById('sbj-navi-home'));
        result.set(NaviEnum.Room, document.getElementById('sbj-navi-room'));
        result.set(NaviEnum.Item, document.getElementById('sbj-navi-item'));
        result.set(NaviEnum.Friend, document.getElementById('sbj-navi-friend'));
        result.set(NaviEnum.Setting, document.getElementById('sbj-navi-setting'));
        result.set(NaviEnum.Instance, document.getElementById('sbj-navi-home-instance'));
        result.set(NaviEnum.Visitor, document.getElementById('sbj-navi-home-visitor'));
        result.set(NaviEnum.LiveCast, document.getElementById('sbj-navi-home-livecast'));

        return result;
    }


    /**
     * 各種イベントの初期化処理
     */
    private InitializeEvent() {

        //  終了処理
        window.onbeforeunload = (e) => {
            //  サーバントが開かれていた場合、なるべく終了処理が実行されるように
            //  フレームをクリアしてからダッシュボードを終了する
            (document.getElementById('sbj-main-home-livecast-frame') as HTMLFrameElement).src = "";
            (document.getElementById('sbj-main-home-visitor-frame') as HTMLFrameElement).src = "";
            (document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement).src = "";
        };

        //  ナビ変更時イベント
        this.CreateNaviMap().forEach((value, key) => {
            value.onclick = (e) => {
                this.Controller.View.DoNaviClick(key);
            }
        });

        //  外部からのドラッグイベント
        document.getElementById("sbj-main").addEventListener('dragover', (e: DragEvent) => {
            if (this._naviView) {
                this._naviView.OnDragFromOutside(e);
            }
        });

        //  ホームインスタンスの変更
        document.getElementById("sbj-main-home-instance-id").onclick = (e) => {

            let peerid = this.GetHomeInstancePeerId();

            //  PeerIDが消された場合、ホームインスタンスを停止する
            if (!peerid) {
                this.RemoveHomeInstance();
            }
            this.DoNaviClick(NaviEnum.Instance);
        };


        //   ホームビジターの起動
        document.getElementById("sbj-main-home-visitor-start").onclick = (e) => {
            let peerid = this.GetHomeInstancePeerId();
            if (peerid.length > 0) {
                this.ChangeHomeVisitor(peerid);
            }
        };


        //  ホームビジターの変更時
        document.getElementById("sbj-main-home-visitor-id").onclick = (e) => {
            let peerid = this.GetHomeVisitorPeeId();
            if (!peerid) {
                //  HomeVisitorが閉じられた場合、ダッシュボード側の表示も閉じる
                this.ChangeHomeVisitor("");
            }
        }


        //  ライブキャスト起動時処理
        document.getElementById("sbj-main-home-livecast-id").onclick = (e) => {

            let peerid = this.GetLivecastOwneerPeeId();
            this.ChangeLiveCast(peerid);

        };

        //  ライブキャストダイアログを非表示（選択ナビの変更）
        document.getElementById("sbj-main-home-livecast-hide").onclick = (e) => {
            this.DoNaviClick(NaviEnum.Visitor);
        };


        //  エントランスID
        document.getElementById("sbj-main-home-entrance-edit").onclick = (e) => {

            let hid = document.getElementById("sbj-main-home-entrance-edit").textContent;

            this.Controller.Model.GetEntrance(hid, (preEntrance) => {

                let dialog = new HomeEditDialogController(null);

                dialog.Show(DialogMode.Edit, preEntrance, (curEntrance) => {
                    if (curEntrance) {
                        this.Controller.Model.UpdateEntrance(curEntrance, () => {
                            //  
                        });
                    }
                });

            });
        };
    }


    private GetHomeInstancePeerId(): string {
        let element = document.getElementById("sbj-main-home-instance-id") as HTMLInputElement;
        if (element && element.textContent && element.textContent.length > 0) {
            return element.textContent;
        }
        else {
            return "";
        }
    }


    private GetHomeVisitorPeeId(): string {
        let element = document.getElementById("sbj-main-home-visitor-id") as HTMLInputElement;
        if (element && element.textContent && element.textContent.length > 0) {
            return element.textContent;
        }
        else {
            return "";
        }
    }


    private GetLivecastOwneerPeeId(): string {
        let element = document.getElementById("sbj-main-home-livecast-id") as HTMLInputElement;
        if (element && element.textContent && element.textContent.length > 0) {
            return element.textContent;
        }
        else {
            return "";
        }
    }


    /**
     * イメージダイアログのコールバック先
     * @param image 
     */
    private OnImageChage(image: ImageInfo) {
        LogUtil.Info(image.src);
    }


    /**
     * ナビボタン押下時の画面切り替え処理
     * @param navi 
     */
    public DoNaviClick(navi: NaviEnum) {

        let mainElement = document.getElementById('sbj-main');
        let title: string = "";
        let disp: DispEnum;

        switch (navi) {

            case NaviEnum.Profile:
                title = "プロフィール";
                disp = DispEnum.Local;
                this._naviView = new ProfileView(this.Controller, mainElement);
                break;
            case NaviEnum.Actor:
                title = "アクター";
                disp = DispEnum.Local;
                this._naviView = new ActorView(this.Controller, mainElement);
                break;
            case NaviEnum.Home:
                title = "招待状";
                disp = DispEnum.Local;
                this._naviView = new EntranceView(this.Controller, mainElement);
                break;
            case NaviEnum.Room:
                title = "ルーム";
                disp = DispEnum.Local;
                this._naviView = new RoomView(this.Controller, mainElement);
                break;
            case NaviEnum.Item:
                title = "ガジェット";
                disp = DispEnum.Local;
                this._naviView = new NotImplementView(mainElement);
                break;
            case NaviEnum.Friend:
                title = "フレンド";
                disp = DispEnum.Local;
                this._naviView = new NotImplementView(mainElement);
                break;
            case NaviEnum.Setting:
                title = "設定";
                disp = DispEnum.Local;
                this._naviView = new SettingController(this.Controller, mainElement);
                break;

            case NaviEnum.Instance:
                if (this.GetHomeInstancePeerId().length > 0) {
                    title = "ホーム（インスタンス起動中）";
                    disp = DispEnum.HomeInstance;
                    this._naviView = new NotImplementView(mainElement);
                }
                else {
                    title = "ホームインスタンスの起動"
                    disp = DispEnum.Local;
                    this._naviView = new BootInstanceView(this.Controller, mainElement);
                }
                break;
            case NaviEnum.Visitor:

                title = "クライアント";
                disp = DispEnum.HomeVisitor;
                this._naviView = new NotImplementView(mainElement);
                break;

            case NaviEnum.LiveCast:

                document.getElementById("sbj-navi-home-livecast-disp").hidden = false;

                title = "ライブキャスト";
                disp = DispEnum.LiveCast;
                this._naviView = new NotImplementView(mainElement);
                break;
        }

        document.getElementById('sbj-main').hidden = (disp !== DispEnum.Local);
        document.getElementById('sbj-header').hidden = (disp !== DispEnum.Local);
        document.getElementById('sbj-main-home-instance').hidden = !(disp === DispEnum.HomeInstance);
        document.getElementById('sbj-main-home-visitor').hidden = !(disp === DispEnum.HomeVisitor || disp === DispEnum.LiveCast);
        document.getElementById('sbj-main-home-livecast-frame').hidden = !(disp === DispEnum.LiveCast);

        this.DoNaviChange(navi, title);
    }


    /**
     * 招待URLから起動した場合の制御
     * @param peerid 
     */
    private InviteLoginInitialize(peerid: string) {
        document.getElementById('sbj-navi-home-instance-disp').hidden = true;
        this.ChangeHomeVisitor(peerid);
        this.DoNaviClick(NaviEnum.Visitor);
    }


    /**
     * ナビ変更時の後処理
     */
    private DoNaviChange(navi: NaviEnum, title: string) {

        //  タイトル変更
        document.getElementById("sbj-home-title").textContent = title;

        //  選択行の変更
        let naviMap = this.CreateNaviMap();
        naviMap.forEach((value, key) => value.classList.remove('sbj-navi-selection'));
        naviMap.get(navi).classList.add('sbj-navi-selection');

        //  NavigationがExpandの場合
        //  Nav選択時にExpandが閉じるようにする
        let elements = document.getElementsByClassName("mdl-layout__obfuscator")
        for (let i = 0; i < elements.length; i++) {
            let html = elements[i] as HTMLElement;

            if (html.classList.contains("is-visible")) {
                html.click();
            }
        }
    }


    /**
     * サーバントの起動有無
     */
    public IsBootServant(): boolean {
        if ((document.getElementById("sbj-main-home-instance-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-visitor-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-livecast-id") as HTMLInputElement).textContent) return true;
        return false;
    }



    /**
     * 
     */
    public StartHomeInstance(url: string) {

        let frmae = document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement;
        frmae.setAttribute('src', url);

    }

    /**
     * 
     */
    public RemoveHomeInstance() {
        this.StartHomeInstance("");
    }


    /**
     * 
     * @param ownerPeerId 
     */
    public ChangeHomeVisitor(ownerPeerId: string) {

        let frame = document.getElementById('sbj-main-home-visitor-frame') as HTMLFrameElement;
        let preUrl = frame.getAttribute('src');
        let newUrl = LinkUtil.CreateLink("../HomeVisitor/index.html", ownerPeerId);

        //  PeerIDが未指定の場合は、フレームを非表示にする
        let isRemove = (ownerPeerId == null || ownerPeerId.length === 0);

        if (preUrl != newUrl) {
            document.getElementById("sbj-navi-home-visitor-disp").hidden = isRemove;
            frame.setAttribute('src', (isRemove ? "" : newUrl));
        }

        if (isRemove) {
            //  招待を受けて起動した場合で、
            //  招待ページに入室しなかった場合 及び 退室時はトップページに遷移する。
            if (document.getElementById('sbj-navi-home-instance-disp').hidden) {
                location.href = LinkUtil.CreateLink("/");
                return;
            }
        }

        this.DoNaviClick(isRemove ? NaviEnum.Instance : NaviEnum.Visitor);
    }


    /**
     * 
     * @param url 
     */
    public ChangeLiveCast(ownerPeerId: string) {

        //  現在表示しているURLの取得
        let frame = document.getElementById('sbj-main-home-livecast-frame') as HTMLFrameElement;
        let preUrl = frame.getAttribute('src');

        if (!preUrl && !ownerPeerId) {
            //  何も表示していない状態かつ、新しいページも開かない場合は何もしない
            return;
        }

        //  PeerIDが未指定の場合は、フレームを非表示にする
        let isRemove = (ownerPeerId == null || ownerPeerId.length === 0);
        let newUrl = LinkUtil.CreateLink("../CastInstance/", ownerPeerId);

        //  URLの変更があった場合のみページを書換える
        if (preUrl !== newUrl) {
            document.getElementById("sbj-navi-home-livecast-disp").hidden = isRemove;
            frame.setAttribute('src', (isRemove ? "" : newUrl));
        }

        this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.LiveCast);
    }


}
