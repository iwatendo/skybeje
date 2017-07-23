
import LocalCache from "../../Base/Common/LocalCache";
import ImageInfo from "../../Base/Container/ImageInfo";
import StdUtil from "../../Base/Util/StdUtil";
import LinkUtil from "../../Base/Util/LinkUtil";
import LogUtil from "../../Base/Util/LogUtil";

import AbstractServiceView, { OnViewLoad } from "../../Base/Common/AbstractServiceView";
import { DialogMode } from "../../Base/Common/AbstractDialogController";

import DashboardController from "./DashboardController";
import { INaviContainer } from "./INaviContainer";

import NotImplementView from "./NotImplement/NotImplementView";
import ProfileView from "./Profile/ProfileView";
import SettingController from "./Setting/SettingController";
import BootInstanceView from "./BootInstance/BootInstanceView";


export enum NaviEnum {
    Profile = 1,
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
        StdUtil.StopPropagation();

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

        //  キー入力時イベント
        document.onkeydown = (e) => {
            if (e.keyCode === 27) {
                //  ホームビジターが起動している状態でのエスケープキーは、ホームビジターを表示させる。
                if (this.IsBootHomeVisitor()) {
                    this.Controller.View.DoNaviClick(NaviEnum.Visitor);
                }
            }
        }

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
                this.RemoveHomeInstance(() => {
                    this.DoNaviClick(NaviEnum.Instance);
                });
            }
            else {
                this.DoNaviClick(NaviEnum.Instance);
            }
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


        //  プロフィール表示
        document.getElementById("sbj-main-home-visitor-profile-id").onclick = (e) => {
            this.DoNaviClick(NaviEnum.Profile);
            document.body.focus();
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
                {
                    let frame = document.getElementById('sbj-main-home-livecast-frame') as HTMLFrameElement;
                    frame.contentDocument.getElementById('sbj-cast-instance-cancel').focus();
                }

                break;
        }

        document.getElementById('sbj-main').hidden = (disp !== DispEnum.Local);
        document.getElementById('sbj-header').hidden = (disp !== DispEnum.Local || navi === NaviEnum.Profile);
        document.getElementById('sbj-main-home-instance-frame').hidden = !(disp === DispEnum.HomeInstance);
        document.getElementById('sbj-main-home-visitor-frame').hidden = !(disp === DispEnum.HomeVisitor || disp === DispEnum.LiveCast || navi === NaviEnum.Profile);
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
     * @param url 
     * @param callback 
     */
    public StartHomeInstance(url: string, callback = null) {

        let frame = document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement;

        frame.onload = (e) => {
            if (callback) callback();
            frame.onload = null;
        };

        frame.setAttribute('src', url);

    }


    /**
     * 
     */
    public RemoveHomeInstance(callback) {
        this.StartHomeInstance("", callback);
    }


    /**
     * ホームビジターが起動しているか？
     */
    public IsBootHomeVisitor(): boolean {
        return (!document.getElementById("sbj-navi-home-visitor-disp").hidden);
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

        //  起動後の表示制御
        let doDispCtrl = () => {
            if (isRemove) {
                if (document.getElementById('sbj-navi-home-instance-disp').hidden) {
                    location.href = LinkUtil.CreateLink("/");
                    return;
                }
            }
            this.DoNaviClick(isRemove ? NaviEnum.Instance : NaviEnum.Visitor);
        }

        //
        if (preUrl == newUrl) {
            doDispCtrl();
        }
        else {
            document.getElementById("sbj-navi-home-visitor-disp").hidden = isRemove;
            frame.onload = (e) => {
                doDispCtrl();
                frame.onload = null;
            }
            frame.src = (isRemove ? "" : newUrl);
        }
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
            frame.onload = (e) => {
                this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.LiveCast);
                frame.onload = null;
            }
            frame.src = (isRemove ? "" : newUrl);
        }
        else {
            this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.LiveCast);
        }
    }


}
