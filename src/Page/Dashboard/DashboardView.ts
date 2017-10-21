
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
import { CastTypeEnum } from "../../Base/Container/CastInstanceSender";
import MobileDialog from "./Mobile/MobileDialog";


export enum NaviEnum {
    Profile = 1,
    Boot = 6,
    Instance = 7,
    Visitor = 8,
    Setting = 9,
    LiveCast = 10,
    LiveCastMobile = 11,
    ScreenShare = 12,
    Gadget = 13,
}

enum DispEnum {
    Local = 0,
    HomeInstance = 1,
    HomeVisitor = 2,
    LiveCast = 3,
    LiveCastMobile = 4,
    ScreenShare = 5,
    Gadget = 6,
}


export default class DashboardView extends AbstractServiceView<DashboardController> {

    private _naviView: INaviContainer = null;
    private _autoboot: boolean;

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

            //  Autoモード、かつ多重起動が検出されなかった場合
            //  ホームインスタンスを直接起動する
            if (LinkUtil.GetArgs("auto") && !LocalCache.BootHomeInstancePeerID) {
                this.DoNaviClick(NaviEnum.Boot);
                this._autoboot = true;
                this.StartHomeInstance();
            }
            else {
                //  ホームインスタンス起動画面の表示
                this.DoNaviClick(NaviEnum.Instance);
            }
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
        result.set(NaviEnum.LiveCastMobile, document.getElementById('sbj-navi-home-livecast-mobile'));
        result.set(NaviEnum.ScreenShare, document.getElementById('sbj-navi-home-screenshare'));
        result.set(NaviEnum.Gadget, document.getElementById('sbj-navi-home-gadget'));

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
            (document.getElementById('sbj-main-home-screenshare-frame') as HTMLFrameElement).src = "";
            (document.getElementById('sbj-main-home-gadget-frame') as HTMLFrameElement).src = "";
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

            //  ホームインスタンスのフレームから
            //  インスタンスPeerIDの削除通知がされた場合、ホームインスタンスを停止する
            if (!peerid) {
                this.StopHomeInstance(() => {
                    this.DoNaviClick(NaviEnum.Instance);
                });
            }
            else {

                if (this._autoboot) {
                    this.DoNaviClick(NaviEnum.Boot);
                    //  AtuoBootの場合
                    //  ホームインスタンスの起動と同時にクライアントも起動
                    this._autoboot = false;
                    this.StartHomveVisitor();
                }
                else {
                    this.DoNaviClick(NaviEnum.Instance);
                }
            }
        };


        //   ホームビジターの起動
        document.getElementById("sbj-main-home-visitor-start").onclick = (e) => {
            this.StartHomveVisitor();
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
            let peerid = this.GetLivecastOwnerPeeId(CastTypeEnum.LiveCast);
            this.ChangeLiveCast(peerid);
        };

        //  ライブキャストダイアログを非表示（選択ナビの変更）
        document.getElementById("sbj-main-home-livecast-hide").onclick = (e) => {
            this.DoNaviClick(NaviEnum.Visitor);
        };


        //  スクリーンシェアの起動時処理
        document.getElementById("sbj-main-home-livecast-screenshare-id").onclick = (e) => {
            let peerid = this.GetLivecastOwnerPeeId(CastTypeEnum.ScreenShare);
            this.ChangeScreenShare(peerid);
        };

        //  スクリーンシェアのダイアログを非表示（選択ナビの変更）
        document.getElementById("sbj-main-home-livecast-screenshare-hide").onclick = (e) => {
            this.DoNaviClick(NaviEnum.Visitor);
        };


        //  ガジェットキャストの起動時処理
        document.getElementById("sbj-main-home-livecast-gadget-id").onclick = (e) => {
            let peerid = this.GetLivecastOwnerPeeId(CastTypeEnum.Gadget);
            this.ChangeGadgetCast(peerid);
        };

        //  ガジェットキャストのダイアログを非表示（選択ナビの変更）
        document.getElementById("sbj-main-home-livecast-gadget-hide").onclick = (e) => {
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


    /**
     * ライブキャストの配信元PeerIDの取得
     * @param castType 
     */
    private GetLivecastOwnerPeeId(castType: CastTypeEnum): string {

        let elementName = "";
        switch (castType) {
            case CastTypeEnum.LiveCast: elementName = "sbj-main-home-livecast-id"; break;
            case CastTypeEnum.ScreenShare: elementName = "sbj-main-home-livecast-screenshare-id"; break;
            case CastTypeEnum.Gadget: elementName = "sbj-main-home-livecast-gadget-id"; break;
        }

        let element = document.getElementById(elementName) as HTMLInputElement;
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
            case NaviEnum.Boot:
                title = "起動しています";
                disp = DispEnum.Local;
                this._naviView = new NotImplementView(mainElement);
                break;
            case NaviEnum.Instance:
                title = "ホームインスタンス";
                if (this.GetHomeInstancePeerId().length > 0) {
                    disp = DispEnum.HomeInstance;
                    this._naviView = new NotImplementView(mainElement);
                }
                else {
                    disp = DispEnum.Local;
                    this._naviView = new BootInstanceView(this.Controller, mainElement);
                }
                break;
            case NaviEnum.Visitor:
                if (!this.IsBootHomeVisitor()) return;
                title = "クライアント";
                disp = DispEnum.HomeVisitor;
                this._naviView = new NotImplementView(mainElement);
                break;
            case NaviEnum.LiveCast:
                title = "ライブキャスト";
                disp = DispEnum.LiveCast;
                this._naviView = new NotImplementView(mainElement);
                this.ChangeLiveCast(this.GetHomeVisitorPeeId());
                break;

            case NaviEnum.LiveCastMobile:
                title = "ライブキャスト（モバイル）";
                disp = DispEnum.HomeVisitor;
                this._naviView = new NotImplementView(mainElement);

                //  ダイアログ表示
                let peerid = this.GetHomeVisitorPeeId();
                let dialog = new MobileDialog(this.Controller);
                let url = LinkUtil.CreateLink("../CastInstanceMobile/", peerid);
                dialog.Show(DialogMode.View, url, null, () => {
                    this.DoNaviClick(NaviEnum.Visitor);
                });

                break;
            case NaviEnum.ScreenShare:
                title = "スクリーンシェア";
                disp = DispEnum.ScreenShare;
                this._naviView = new NotImplementView(mainElement);
                this.ChangeScreenShare(this.GetHomeVisitorPeeId());
                break;
            case NaviEnum.Gadget:
                title = "ガジェット";
                disp = DispEnum.Gadget;
                this._naviView = new NotImplementView(mainElement);
                this.ChangeGadgetCast(this.GetHomeVisitorPeeId());
                break;
        }

        document.getElementById('sbj-main').hidden = (disp !== DispEnum.Local);
        //  document.getElementById('sbj-header').hidden = (disp !== DispEnum.Local);
        document.getElementById('sbj-main-home-instance-frame').hidden = !(disp === DispEnum.HomeInstance);
        document.getElementById('sbj-main-home-visitor-frame').hidden = !(disp === DispEnum.HomeVisitor || disp === DispEnum.LiveCast || disp === DispEnum.ScreenShare || navi === NaviEnum.Gadget || navi === NaviEnum.Profile);
        document.getElementById('sbj-main-home-livecast-frame').hidden = !(disp === DispEnum.LiveCast);
        document.getElementById('sbj-main-home-screenshare-frame').hidden = !(disp === DispEnum.ScreenShare);
        document.getElementById('sbj-main-home-gadget-frame').hidden = !(disp === DispEnum.Gadget);

        let header = document.getElementById('sbj-header');

        if (disp === DispEnum.Local && navi !== NaviEnum.Profile) {
            header.style.position = "static";
            header.style.maxWidth = "none";
        }
        else {
            title = "";
            header.style.maxWidth = "72px";
            header.style.position = "absolute";
            header.style.top = "0";
            header.style.left = "0";
        }

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

        if (naviMap.has(navi)) {
            naviMap.get(navi).classList.add('sbj-navi-selection');
        }

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
    public IsBootServent(): boolean {
        if ((document.getElementById("sbj-main-home-instance-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-visitor-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-livecast-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-livecast-screenshare-id") as HTMLInputElement).textContent) return true;
        if ((document.getElementById("sbj-main-home-livecast-gadget-id") as HTMLInputElement).textContent) return true;
        return false;
    }



    /**
     * ホームインスタンスの起動
     */
    public StartHomeInstance() {

        let element = document.getElementById('sbj-home-instance-url') as HTMLLinkElement;
        let url = element.href;
        let frame = document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement;

        frame.onload = (e) => {
            frame.onload = null;
        };

        frame.setAttribute('src', url);
    }


    /**
     * ホームインスタンスの停止
     */
    public StopHomeInstance(callback) {
        let frame = document.getElementById('sbj-main-home-instance-frame') as HTMLFrameElement;

        frame.onload = (e) => {
            if (callback) callback();
            frame.onload = null;
        };
        frame.setAttribute('src', "");
    }


    /**
     * ホームビジターが起動しているか？
     */
    public IsBootHomeVisitor(): boolean {
        return (!document.getElementById("sbj-navi-home-visitor-disp").hidden);
    }


    /**
     * ホームビジターを起動
     */
    public StartHomveVisitor() {
        let peerid = this.GetHomeInstancePeerId();
        if (peerid.length > 0) {
            this.ChangeHomeVisitor(peerid);
        }
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
                document.getElementById("sbj-navi-livecast-group-disp").hidden = isRemove;
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
            frame.onload = (e) => {
                this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.LiveCast);
                frame.onload = null;
            }
            frame.src = (isRemove ? "" : newUrl);
        }
        else {
            if (isRemove)
                this.DoNaviClick(NaviEnum.Visitor)
            else {
                frame.hidden = false;
            }
        }
    }


    /**
     * 
     * @param url 
     */
    public ChangeScreenShare(ownerPeerId: string) {

        //  現在表示しているURLの取得
        let frame = document.getElementById('sbj-main-home-screenshare-frame') as HTMLFrameElement;
        let preUrl = frame.getAttribute('src');

        if (!preUrl && !ownerPeerId) {
            //  何も表示していない状態かつ、新しいページも開かない場合は何もしない
            return;
        }

        //  PeerIDが未指定の場合は、フレームを非表示にする
        let isRemove = (ownerPeerId == null || ownerPeerId.length === 0);
        let newUrl = LinkUtil.CreateLink("../CastInstanceScreenShare/", ownerPeerId);

        //  URLの変更があった場合のみページを書換える
        if (preUrl !== newUrl) {
            frame.onload = (e) => {
                this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.ScreenShare);
                frame.onload = null;
            }
            frame.src = (isRemove ? "" : newUrl);
        }
        else {
            if (isRemove)
                this.DoNaviClick(NaviEnum.Visitor)
            else {
                frame.hidden = false;
            }
        }
    }


    /**
     * 
     * @param url 
     */
    public ChangeGadgetCast(ownerPeerId: string) {

        //  現在表示しているURLの取得
        let frame = document.getElementById('sbj-main-home-gadget-frame') as HTMLFrameElement;
        let preUrl = frame.getAttribute('src');

        if (!preUrl && !ownerPeerId) {
            //  何も表示していない状態かつ、新しいページも開かない場合は何もしない
            return;
        }

        //  PeerIDが未指定の場合は、フレームを非表示にする
        let isRemove = (ownerPeerId == null || ownerPeerId.length === 0);
        let newUrl = LinkUtil.CreateLink("../GadgetInstance/", ownerPeerId);

        //  URLの変更があった場合のみページを書換える
        if (preUrl !== newUrl) {
            frame.onload = (e) => {
                this.DoNaviClick(isRemove ? NaviEnum.Visitor : NaviEnum.Gadget);
                frame.onload = null;
            }
            frame.src = (isRemove ? "" : newUrl);
        }
        else {
            if (isRemove)
                this.DoNaviClick(NaviEnum.Visitor)
            else {
                frame.hidden = false;
            }
        }
    }

}
