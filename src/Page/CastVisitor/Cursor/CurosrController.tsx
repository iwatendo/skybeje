import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Contents/IndexedDB/Personal";
import { CursorComponent } from "./CursorComponent";
import LinkUtil from "../../../Base/Util/LinkUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import LogUtil from "../../../Base/Util/LogUtil";
import IServiceController from '../../../Base/IServiceController';
import GetIconSender from '../../../Contents/Sender/GetIconSender';
import IconCursorSender from '../../../Contents/Sender/IconCursorSender';


export class VideoDispOffset {
    dispWidth: number = 0;
    dispHeight: number = 0;
    offsetRight: number = 0;
    offsetTop: number = 0;
}

/**
 * 
 */
export class CastCursor {

    /**
     * 
     * @param peerid 
     * @param aid 
     * @param iid 
     * @param name 
     * @param x 
     * @param y 
     * @param isDisp
     */
    constructor(peerid: string, aid: string, iid: string, name: string, x: number, y: number, isDisp: boolean) {
        this.peerid = peerid;
        this.aid = aid;
        this.iid = iid;
        this.name = name;
        this.posX = x;
        this.posY = y;
        this.isDisp = isDisp;
    }

    peerid: string = "";
    aid: string = "";
    iid: string = "";
    posX: number = 0;
    posY: number = 0;
    name: string = null;
    isDisp: boolean = false;
}


/**
 * 
 */
export class CursorController {

    private _service: IServiceController;
    private _video: HTMLVideoElement;
    private _cursorDispElement: HTMLElement;
    private _busy: boolean = false;
    private _queue: IconCursorSender = null;
    private _baseCursorList = new Array<IconCursorSender>();   //  送られて来たカーソル情報の保持（相対座標）
    private _cursorList = new Array<CastCursor>();             //  表示しているカーソル情報の保持（絶対座標）
    private _iconCache = new Map<string, Map<string, Personal.Icon>>();

    private _ownerPeerIdElement = document.getElementById('peerid') as HTMLInputElement;
    private _ownerAidElement = document.getElementById('aid') as HTMLInputElement;
    private _ownerIidElement = document.getElementById('iid') as HTMLInputElement;

    private _homePeerId: string;

    private static _videoHeight = 0;
    private static _cursorOffsetX = 0;
    private static _cursorOffsetY = 0;
    private static _mineCursor: IconCursorSender = null;

    /**
     * 初期化処理
     * @param service
     * @param connCache 
     * @param video 
     * @param itemDivElement 
     * @param cursorDivElement 
     */
    public constructor(service: IServiceController, video: HTMLVideoElement, itemDivElement: HTMLElement, cursorDivElement: HTMLElement) {

        this._service = service;
        this._video = video;
        this._cursorDispElement = cursorDivElement;

        itemDivElement.onmousedown = (ev: MouseEvent) => {

            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.CastCursorSend(this._video, itemDivElement, ev.clientX, ev.clientY, true);
            }
        };

        itemDivElement.onmousemove = (ev: MouseEvent) => {
            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.CastCursorSend(this._video, itemDivElement, ev.clientX, ev.clientY, true);
            }
        };

        itemDivElement.oncontextmenu = (pv: PointerEvent) => {
            //  右クリック時カーソルを消す。
            this.CastCursorSend(this._video, itemDivElement, 0, 0, false);
            //  コンテキストメニューのキャンセル
            return false;
        }

        window.onresize = ((ev) => { this.DisplayAll(); });

        window.onbeforeunload = (ev) => {
            //  接続が切れた場合、カーソルを非表示にする
            this.CastCursorSend(this._video, itemDivElement, 0, 0, false);
        }

        this._homePeerId = this._ownerPeerIdElement.textContent;
        this._ownerPeerIdElement.onchange = (e) => {
            this._homePeerId = this._ownerPeerIdElement.textContent;
        }
    }


    /**
     * カーソルポートか？
     * @param ev 
     */
    public IsCursorPort(ev: MouseEvent) {

        let targetId = (ev.target as any).id;
        if (targetId === "sbj-cact-visitor-cursor-port") {
            return true;
        }

        let targetClassName: string = (ev.target as any).className;

        if (targetClassName.indexOf("sbj-cact-visitor-cursor") >= 0) {
            return true;
        }

        return false;
    }



    /**
     * 表示のクリア処理
     */
    public Clear() {

        this.ClearQueue();
        this._baseCursorList = new Array<IconCursorSender>();
        this._cursorList = new Array<CastCursor>();

        //  カーソル表示があればクリア
        ReactDOM.render(<CursorComponent CursorList={this._cursorList} />, this._cursorDispElement, (el) => {
            this.SetCursorIcon(this._cursorList);
        });
    };


    /**
     * カーソルのキュー情報をクリア
     */
    public ClearQueue() {
        this._queue = null;
        this._busy = false;
    }


    /**
     * ピアの切断等によるカーソル表示の削除
     * @param peerid 
     */
    public Remove(peerid: string) {
        this._baseCursorList = this._baseCursorList.filter(cur => cur.homePeerId !== peerid);
        this._cursorList = this._cursorList.filter(cur => cur.peerid !== peerid);
        this.DisplayAll();
    }


    /**
     * 
     */
    public DisplayAll() {
        this.ClearQueue();
        let vdo = this.GetVideoDispOffset(this._video);
        this._baseCursorList.forEach((cur, key) => { this.Display(cur); });
    }


    /**
     * Sendされてきたカーソルデータを保持して表示
     * @param cursor
     */
    public SetCursor(cursor: IconCursorSender) {

        //  前回の情報は削除
        this._baseCursorList = this._baseCursorList.filter((c) => c.homePeerId !== cursor.homePeerId);

        //  最後尾に追加する
        this._baseCursorList.push(cursor);
        this.Display(cursor);
    }


    /**
     * Sendされてきたカーソルデータを保持する
     * @param cursor
     */
    public SetDispCursor(cursor: CastCursor) {

        //  前回情報は削除して最後尾に追加する
        this._cursorList = this._cursorList.filter((c) => c.peerid !== cursor.peerid);
        this._cursorList.push(cursor);
    }


    /**
     * 自身のカーソルをCastInstanceに送信する
     * @param sender 
     */
    private SendCursorToOwner(sender: IconCursorSender) {
        CursorController._mineCursor = sender;
        this._service.SwPeer.SendToOwner(sender);
    }


    /**
     * 最終発言をしたアクター情報をセット
     * @param aid 
     * @param iid 
     */
    public SetLastChatActor(aid: string, iid: string) {
        let sender = CursorController._mineCursor;

        if (sender && sender.isDisp) {

            //  発言アクターに変更があった場合、表示を差替える
            if (sender.aid !== aid || sender.iid !== iid) {
                sender.aid = aid;
                sender.iid = iid;
                this.SendCursorToOwner(sender);
            }
        }
    }


    /**
     * マウスカーソルの表示処理
     * @param cursor
     */
    private Display(cursor: IconCursorSender) {

        let vdo = this.GetVideoDispOffset(this._video);

        let cursorX = Math.round(cursor.posRx * vdo.dispWidth + vdo.offsetRight);
        let cursorY = Math.round(cursor.posRy * vdo.dispHeight + vdo.offsetTop);

        let dispCursor = new CastCursor(cursor.homePeerId, cursor.aid, cursor.iid, "", cursorX, cursorY, cursor.isDisp);
        this.SetDispCursor(dispCursor);

        CursorController._videoHeight = vdo.dispHeight;

        //  描画処理
        ReactDOM.render(<CursorComponent CursorList={this._cursorList} />, this._cursorDispElement, (el) => {
            //  描画後、カーソルのCSSを設定する
            this.SetCursorIcon(this._cursorList);

        });

        setTimeout(() => {
            //  queueがある場合、最後に送信する
            if (this._queue !== null && this._queue.aid === cursor.aid) {
                this.SendCursorToOwner(this._queue);
                this._queue = null;
            }
            else {
                this._busy = false;
            }
        }, 10);
    }


    /**
     * ビデオ上のマウスカーソルの動作を検出し、CastInstanceに送信
     * 自身のキャスト上だとしても CastInstance 経由でカーソルを表示させる
     * @param video 
     * @param cursorpost 
     * @param clientX 
     * @param clientY 
     * @param isDisp
     */
    private CastCursorSend(video: HTMLVideoElement, cursorpost: HTMLElement, clientX: number, clientY: number, isDisp: boolean) {

        if (!this._homePeerId) {
            return;
        }

        //  座標オフセットの取得
        let vdo = this.GetVideoDispOffset(video);

        //  offsetXY → ClientXYに変更（CursorのDiv上の移動イベントを取得したい為）
        let posRx: number = (clientX - vdo.offsetRight - CursorController._cursorOffsetX) / vdo.dispWidth;
        let posRy: number = (clientY - vdo.offsetTop - CursorController._cursorOffsetY) / vdo.dispHeight;


        let sender = new IconCursorSender();
        sender.homePeerId = this._homePeerId;
        sender.visitorPeerId = this._service.SwPeer.PeerId;
        sender.aid = this._ownerAidElement.textContent;
        sender.iid = this._ownerIidElement.textContent;

        sender.posRx = posRx;
        sender.posRy = posRy;
        sender.isDisp = isDisp;

        if (this._busy) {
            this._queue = sender;
        }
        else {
            this._busy = true;
            this.SendCursorToOwner(sender);
        }
    }


    /**
     * Videoの表示エリアのオフセット値計算（送信時/受信時共通処理）
     * @param video
     */
    private GetVideoDispOffset(video: HTMLVideoElement): VideoDispOffset {

        let videoWidth: number = video.videoWidth;
        let videoHeight: number = video.videoHeight;
        let videoAspect: number = videoWidth / videoHeight;

        let divWidth: number = video.clientWidth;
        let divHeight: number = video.clientHeight;
        let divAscpet: number = divWidth / divHeight;

        let result = new VideoDispOffset();

        if (divAscpet > videoAspect) {
            //  divが横に長い場合・・・
            result.dispHeight = divHeight;
            result.dispWidth = result.dispHeight * videoAspect;
            result.offsetTop = 0;
            result.offsetRight = (divWidth - result.dispWidth) / 2;
        }
        else {
            //  divが縦に長い場合
            result.dispWidth = divWidth;
            result.dispHeight = result.dispWidth / videoAspect;
            result.offsetRight = 0;
            result.offsetTop = (divHeight - result.dispHeight) / 2;
        }

        return result;
    }


    /**
     * アイコン表示処理
     * @param cursors 
     */
    public SetCursorIcon(cursors: Array<CastCursor>) {

        let iidmap = new Map<string, Array<string>>();

        cursors.forEach((cur) => {

            let iid = cur.iid;
            let peerid = cur.peerid;

            if (!iid) {
                return;
            }

            if (this._iconCache.has(peerid)) {

                let iconMap = this._iconCache.get(peerid);

                //  キャッシュ済みの場合、キャッシュアイコンを表示
                if (iconMap.has(iid)) {
                    let icon = iconMap.get(iid);
                    this.DispIcon(icon);
                    return;
                }
            }

            //  キャッシュされていない場合は
            //  発言者にIconデータを要求
            this.GetIcon(peerid, iid);

        });
    }


    /**
     * 他ユーザーへのアイコン要求
     * @param peerid 
     * @param iids 
     */
    private GetIcon(peerid: string, iid: string) {

        //  他ユーザーへ接続しアイコンの要求
        let sender = new GetIconSender();
        sender.iid = iid;
        this._service.SwPeer.SendTo(peerid, sender);

        //  アイコンが取得できるまで、再要求しないように空アイコンをキャッシュ
        let emptyIcon = new Personal.Icon();
        emptyIcon.iid = iid;
        this.SetIcon(peerid, emptyIcon);

    }


    /**
     * アイコン画像の表示及びキャッシュ
     * @param peerid 
     * @param icon
     */
    public SetIcon(peerid: string, icon: Personal.Icon) {

        //  キャッシュ登録
        if (!this._iconCache.has(peerid)) {
            this._iconCache.set(peerid, (new Map<string, Personal.Icon>()));
        }
        let map = this._iconCache.get(peerid);
        map.set(icon.iid, icon);

        //  アイコン表示処理
        this.DispIcon(icon);
    }


    /**
     * カーソルのアイコン描画処理(CSS設定)
     * @param icon 
     */
    private DispIcon(icon: Personal.Icon) {

        if (!icon) {
            return;
        }

        let imgclassName = "sbj-cact-visitor-cursor-image-" + icon.iid.toString();
        let elements = document.getElementsByClassName(imgclassName);

        for (var i = 0; i < elements.length; i++) {
            let element = elements[i] as HTMLElement;
            if (element.style) {
                ImageInfo.SetElementCss(element, icon.img);

                let size: number;

                if (icon.dispratio && icon.dispratio > 0) {
                    size = Math.round(CursorController._videoHeight * icon.dispratio / 100);
                }
                else {
                    //  デフォルトは高さに対して 8% とする
                    size = Math.round(CursorController._videoHeight * 8 / 100);
                }

                let iconsize = size.toString() + "px";
                let mergin = Math.round(size / 2);
                element.style.width = iconsize;
                element.style.height = iconsize;
                element.style.margin = "-" + mergin.toString() + "px";

                //  自分自身のアイコンの場合はクリックイベントを追加する
                if (icon.iid === this._ownerIidElement.textContent) {

                    element.onmousedown = (e) => {
                        CursorController._cursorOffsetX = e.offsetX - mergin;
                        CursorController._cursorOffsetY = e.offsetY - mergin;
                        element.style.cursor = "-webkit-grabbing";
                    }

                    let clearOffsset = () => {
                        CursorController._cursorOffsetX = 0;
                        CursorController._cursorOffsetY = 0;
                        element.style.cursor = "default";
                    }

                    element.onmouseout = (e) => clearOffsset();
                    element.onmouseup = (e) => clearOffsset();

                    //  イメージ画像として掴んでしまい、うまく動かせないケースの対策
                    element.onselectstart = (e) => { return false; }
                    element.onmousemove = (e) => { return false; }
                }
            }
        }
    }

}