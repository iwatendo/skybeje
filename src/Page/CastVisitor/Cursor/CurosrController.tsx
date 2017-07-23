import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Base/IndexedDB/Personal";
import { CursorComponent } from "./CursorComponent";
import { CastCursorSender } from "../../CastInstance/CastInstanceContainer";
import WebRTCService from "../../../Base/Common/WebRTCService";
import LinkUtil from "../../../Base/Util/LinkUtil";
import ImageInfo from "../../../Base/Container/ImageInfo";
import { GetIconSender } from "../../HomeVisitor/HomeVisitorContainer";
import ConnectionCache from "../../../Base/Common/ConnectionCache";
import LogUtil from "../../../Base/Util/LogUtil";


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
     */
    constructor(peerid: string, aid: string, iid: string, name: string, x: number, y: number) {
        this.peerid = peerid;
        this.aid = aid;
        this.iid = iid;
        this.name = name;
        this.posX = x;
        this.posY = y;
    }

    peerid: string = "";
    aid: string = "";
    iid: string = "";
    posX: number = 0;
    posY: number = 0;
    name: string = null;
}


/**
 * 
 */
export class CursorController {

    private _video: HTMLVideoElement;
    private _cursorDispElement: HTMLElement;
    private _busy: boolean = false;
    private _queue: CastCursorSender = null;
    private _cursorMap = new Map<string, CastCursor>();
    private _baseCursorMap = new Map<string, CastCursorSender>();
    private _iconCache = new Map<string, Map<string, Personal.Icon>>();
    private _connCache: ConnectionCache;

    private _ownerPeerIdElement = document.getElementById('peerid') as HTMLInputElement;
    private _ownerAidElement = document.getElementById('aid') as HTMLInputElement;
    private _ownerIidElement = document.getElementById('iid') as HTMLInputElement;


    /**
     * 初期化処理
     * @param connCache 
     * @param video 
     * @param itemDivElement 
     * @param cursorDivElement 
     */
    public constructor(connCache: ConnectionCache, video: HTMLVideoElement, itemDivElement: HTMLElement, cursorDivElement: HTMLElement) {

        this._connCache = connCache;
        this._video = video;
        this._cursorDispElement = cursorDivElement;

        itemDivElement.onclick = (ev: MouseEvent) => {

        }


        itemDivElement.onmousedown = (ev: MouseEvent) => {

            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.CastCursorSend(this._video, itemDivElement, ev.clientX, ev.clientY);
            }
        };

        itemDivElement.onmousemove = (ev: MouseEvent) => {
            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.CastCursorSend(this._video, itemDivElement, ev.clientX, ev.clientY);
            }
        };

        itemDivElement.oncontextmenu = (pv: PointerEvent) => {
            //  右クリック時カーソルを消す。
            this.CastCursorSend(this._video, itemDivElement, -1, -1);
            //  コンテキストメニューのキャンセル
            return false;
        }

        window.onresize = ((ev) => { this.DisplayAll(); });

        window.onbeforeunload = (ev) => {
            //  接続が切れた場合、カーソルを非表示にする
            this.CastCursorSend(this._video, itemDivElement, -1, -1);
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
        this._baseCursorMap.clear();
        this._cursorMap.clear();
        let cursorArray = new Array<CastCursor>();

        //  カーソル表示があればクリア
        ReactDOM.render(<CursorComponent CursorList={cursorArray} />, this._cursorDispElement, (el) => {
            this.SetCursorIcon(cursorArray);
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
     * 
     */
    public DisplayAll() {
        this.ClearQueue();
        let vdo = this.GetVideoDispOffset(this._video);
        this._baseCursorMap.forEach((cur, key) => { this.Display(cur); });
    }


    /**
     * Sendされてきたカーソルデータを保持し、表示
     * @param cursor
     */
    public SetCursor(cursor: CastCursorSender) {
        this._baseCursorMap.set(cursor.peerid, cursor);
        this.Display(cursor);
    }


    /**
     * マウスカーソルの表示処理
     * @param cursor
     */
    private Display(cursor: CastCursorSender) {

        let vdo = this.GetVideoDispOffset(this._video);

        let cursorX = Math.round(cursor.posRx * vdo.dispWidth + vdo.offsetRight);
        let cursorY = Math.round(cursor.posRy * vdo.dispHeight + vdo.offsetTop);

        let dispCursor = new CastCursor(cursor.peerid, cursor.aid, cursor.iid, "", cursorX, cursorY);
        this._cursorMap.set(cursor.peerid, dispCursor);

        let cursorArray = new Array<CastCursor>();
        this._cursorMap.forEach((value, key) => cursorArray.push(value));


        //  描画処理
        ReactDOM.render(<CursorComponent CursorList={cursorArray} />, this._cursorDispElement, (el) => {
            //  描画後、カーソルのCSSを設定する
            this.SetCursorIcon(cursorArray);

        });


        //  ququeがある場合、最後に送信する
        if (this._queue !== null && this._queue.aid === cursor.aid) {
            WebRTCService.OwnerSend(this._queue);
            this._queue = null;
        }
        else {
            this._busy = false;
        }
    }


    /**
     * ビデオ上のマウスカーソルの動作を検出し、CastInstanceに送信
     * 自身のキャスト上だとしても CastInstance 経由でカーソルを表示させる
     * @param video 
     * @param cursorpost 
     * @param clientX 
     * @param clientY 
     */
    private CastCursorSend(video: HTMLVideoElement, cursorpost: HTMLElement, clientX: number, clientY: number) {

        //  座標オフセットの取得
        let vdo = this.GetVideoDispOffset(video);

        //  offsetXY → ClientXYに変更（CursorのDiv上の移動イベントを取得したい為）
        let posRx: number = (clientX - vdo.offsetRight) / vdo.dispWidth;
        let posRy: number = (clientY - vdo.offsetTop) / vdo.dispHeight;


        let sender = new CastCursorSender();
        sender.peerid = this._ownerPeerIdElement.textContent;
        sender.aid = this._ownerAidElement.textContent;
        sender.iid = this._ownerIidElement.textContent;

        if (posRx > 0.0 && posRx < 1.0 && posRy > 0.0 && posRy < 1.0) {
            sender.posRx = posRx;
            sender.posRy = posRy;
        }
        else {
            sender.posRx = -1;
            sender.posRy = -1;
        }

        if (this._busy) {
            this._queue = sender;
        }
        else {
            this._busy = true;
            WebRTCService.OwnerSend(sender);
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
     *  アイコン表示用処理
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
        this._connCache.GetExec(peerid, (conn) => {
            let sender = new GetIconSender();
            sender.iid = iid;
            WebRTCService.ChildSend(conn, sender);
        });

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