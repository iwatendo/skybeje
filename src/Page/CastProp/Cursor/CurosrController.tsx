import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../../Contents/IndexedDB/Personal";
import CursorComponent from "./CursorComponent";
import IServiceController from '../../../Base/IServiceController';
import GetIconSender from '../../../Contents/Sender/GetIconSender';
import IconCursorSender from '../../../Contents/Sender/IconCursorSender';
import ChatStatusSender from '../../../Contents/Sender/ChatStatusSender';
import LocalCache from '../../../Contents/Cache/LocalCache';
import StyleCache from '../../../Contents/Cache/StyleCache';
import CastCursor from './CastCursor';


export class VideoDispOffset {
    dispWidth: number = 0;
    dispHeight: number = 0;
    offsetRight: number = 0;
    offsetTop: number = 0;
}

/**
 * 
 */
export default class CursorController {

    private _service: IServiceController;
    private _video: HTMLVideoElement;
    private _cursorDispElement: HTMLElement;
    private _busy: boolean = false;
    private _queue: IconCursorSender = null;
    private _baseCursorList = new Array<IconCursorSender>();   //  送られて来たカーソル情報の保持（相対座標）
    private _cursorList = new Array<CastCursor>();             //  表示しているカーソル情報の保持（絶対座標）

    private static _videoHeight = 0;

    public IconCursor: IconCursorSender;
    public DispIid: string;


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
                this.CastCursorSend(ev.clientX, ev.clientY, true);
            }
        };

        itemDivElement.onmousemove = (ev: MouseEvent) => {
            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.CastCursorSend(ev.clientX, ev.clientY, true);
            }
        };

        if (LocalCache.DebugMode === 0) {
            itemDivElement.oncontextmenu = (pv: PointerEvent) => {
                //  右クリック時カーソルを消す。
                this.CastCursorSend(0, 0, false);
                //  コンテキストメニューのキャンセル
                return false;
            }
        }

        window.onresize = ((ev) => { this.DisplayAll(); });

        window.onbeforeunload = (ev) => {
            //  接続が切れた場合、カーソルを非表示にする
            this.CastCursorSend(0, 0, false);
        }

    }


    /**
     * カーソルポートか？
     * @param ev 
     */
    public IsCursorPort(ev: MouseEvent) {

        let targetId = (ev.target as any).id;
        if (targetId === "sbj-cast-cursor-port") {
            return true;
        }

        let targetClassName: string = (ev.target as any).className;

        if (targetClassName.indexOf("sbj-cast-cursor") >= 0) {
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
        ReactDOM.render(<CursorComponent controller={this} CursorList={this._cursorList} />, this._cursorDispElement, (el) => {
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
        this.DispIid = sender.iid;
        this._service.SwPeer.SendToOwner(sender);
    }



    public SetChatStatus(cur: ChatStatusSender) {

        if (!this.IconCursor) {
            this.IconCursor = new IconCursorSender();
            this.IconCursor.homePeerId = cur.peerid;
            this.IconCursor.visitorPeerId = this._service.SwPeer.PeerId;
        }
        this.IconCursor.aid = cur.aid;
        this.IconCursor.iid = cur.iid;

        //「発言時にカーソルアイコンを切替える」にチェックが入っている場合で
        // アイコン（またはアクター）が変更されていた場合は表示を自身のアイコン表示を切替える 
        if (cur.isDispChange && cur.message.length > 0 && cur.iid !== this.DispIid) {
            this.SendCursorToOwner(this.IconCursor);
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
        ReactDOM.render(<CursorComponent controller={this} CursorList={this._cursorList} />, this._cursorDispElement, (el) => {
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
     * @param clientX 
     * @param clientY 
     * @param isDisp
     */
    public CastCursorSend(clientX: number, clientY: number, isDisp: boolean) {

        let sender = this.IconCursor;

        if (sender) {

            //  座標のオフセット取得
            let vdo = this.GetVideoDispOffset(this._video);
            //  offsetXY → ClientXYに変更（CursorのDiv上の移動イベントを取得したい為）
            sender.posRx = (clientX - vdo.offsetRight) / vdo.dispWidth;
            sender.posRy = (clientY - vdo.offsetTop) / vdo.dispHeight;
            sender.isDisp = isDisp;

            if (this._busy) {
                this._queue = sender;
            }
            else {
                this._busy = true;
                this.SendCursorToOwner(sender);
            }
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


    private _requestMap = new Map<string, string>();

    /**
     * アイコン表示処理
     * @param cursors 
     */
    public SetCursorIcon(cursors: Array<CastCursor>) {

        cursors.forEach((cur) => {

            if (cur) {
                let key = cur.peerid + cur.iid;

                if (!this._requestMap.has(key) && !StyleCache.HasIconStyle(key)) {
                    //  アイコンが、未キャッシュ/未リクエストの場合、他ユーザーにアイコンを要求
                    let sender = new GetIconSender();
                    sender.iid = cur.iid;
                    this._service.SwPeer.SendTo(cur.peerid, sender);
                    this._requestMap.set(key, key);
                }
                else {
                    //  キャッシュ済みの場合はサイズ調整のみ実施
                    if (this._iconDispratioCache.has(key)) {
                        let dispratio = this._iconDispratioCache.get(key);
                        this.SetIconSize(key, dispratio);
                    }
                }
            }
        });
    }


    private _iconDispratioCache = new Map<string, number>();

    /**
     * アイコン画像の表示及びキャッシュ
     * @param peerid 
     * @param icon
     */
    public SetIcon(peerid: string, icon: Personal.Icon) {

        let key = peerid + icon.iid;

        //  CSS変数として登録
        StyleCache.SetIconStyle(key, icon.img);

        this._iconDispratioCache.set(key, icon.dispratio);
        this.SetIconSize(key, icon.dispratio);
    }


    /**
     * アイコンサイズの調整
     * @param key 
     * @param dispratio 
     */
    public SetIconSize(key: string, dispratio: number) {

        //  アイコンのサイズ調整
        let size: number;
        if (dispratio && dispratio > 0) {
            size = Math.round(CursorController._videoHeight * dispratio / 100);
        }
        else {
            //  デフォルトは高さに対して 8% とする
            size = Math.round(CursorController._videoHeight * 8 / 100);
        }
        StyleCache.SetIconSize(key, size);
    }

}