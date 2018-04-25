import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Personal from "../../Contents/IndexedDB/Personal";
import IServiceController from '../../Base/IServiceController';
import GetIconSender from '../../Contents/Sender/GetIconSender';
import IconCursorSender from '../../Contents/Sender/IconCursorSender';
import ChatStatusSender from '../../Contents/Sender/ChatStatusSender';
import LocalCache from '../../Contents/Cache/LocalCache';
import StyleCache from '../../Contents/Cache/StyleCache';
import CastSubTitlesSender from '../../Contents/Sender/CastSubTitlesSender';

import CastCursor from './Cursor/CastCursor';
import SubTitlesComponent from './SubTitles/SubTitlesComponent';
import CastPropComponent from './CastPropComponent';
import IntervalSend from '../../Base/Util/IntervalSend';
import CursorDispOffset from './CursorDispOffset';

interface GetDispOffset { (): CursorDispOffset }

/**
 * 
 */
export default class CastPropController {

    private _service: IServiceController;
    private _cursorDispElement: HTMLElement;
    private _baseCursorList = new Array<IconCursorSender>();   //  送られて来たカーソル情報の保持（相対座標）
    private _cursorList = new Array<CastCursor>();             //  表示しているカーソル情報の保持（絶対座標）
    private _subtitles = new CastSubTitlesSender("");

    private static _vdo: CursorDispOffset;
    private static _getOffset: GetDispOffset;

    public IconCursor: IconCursorSender;
    public DispIid: string;
    private _intervalSend = new IntervalSend<IconCursorSender>(20);

    public static OffsetX: number = 0;
    public static OffsetY: number = 0;


    /**
     * 初期化処理
     * @param service
     * @param connCache 
     * @param itemDivElement 
     * @param cursorDivElement 
     */
    public constructor(service: IServiceController, itemDivElement: HTMLElement, cursorDivElement: HTMLElement, getOffset: GetDispOffset, onrisize = null) {

        this._service = service;
        CastPropController._getOffset = getOffset;
        this._cursorDispElement = cursorDivElement;

        itemDivElement.onmousedown = (ev: MouseEvent) => {
            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.SendCastCursor(ev.clientX, ev.clientY, true);
            }
        };

        itemDivElement.onmousemove = (ev: MouseEvent) => {
            if (ev.buttons === 1 && this.IsCursorPort(ev)) {
                this.SendCastCursor(ev.clientX, ev.clientY, true);
            }
        };

        if (LocalCache.DebugMode === 0) {
            itemDivElement.oncontextmenu = (pv: PointerEvent) => {
                //  右クリック時カーソルを消す。
                this.SendCastCursor(0, 0, false);
                //  コンテキストメニューのキャンセル
                return false;
            }
        }

        window.onresize = ((ev) => {
            if (onrisize) {
                onrisize();
            }
            this.DisplayAll();
        });

        window.onbeforeunload = (ev) => {
            //  接続が切れた場合、カーソルを非表示にする
            this.SendCastCursor(0, 0, false);
        }

    }


    /**
     * 字幕表示
     * @param csr 
     */
    public SetMessage(csr: CastSubTitlesSender) {
        this._subtitles = csr;
        this.DoRender();
    }


    /**
     * 描画処理
     */
    private DoRender() {
        let vdo = CastPropController._getOffset();
        ReactDOM.render(<CastPropComponent controller={this} cursorList={this._cursorList} subtitles={this._subtitles} offset={vdo} />, this._cursorDispElement, () => {
            this.SetCursorIcon(this._cursorList);
        });
    }

    /**
     * ビデオ上のマウスカーソルの動作を検出し、CastInstanceに送信
     * ※自身のキャスト上だとしても CastInstance 経由でカーソルを表示する
     * @param video 
     * @param clientX 
     * @param clientY 
     * @param isDisp
     */
    public SendCastCursor(clientX: number, clientY: number, isDisp: boolean) {

        let sender = this.IconCursor;

        if (sender) {

            //  座標のオフセット取得
            let offset = CastPropController._getOffset();

            if (isDisp && offset.clientWidth === 0 && offset.clientHeight === 0) {
                return;
            }

            //  offsetXY → ClientXYに変更（CursorのDiv上の移動イベントを取得したい為）
            sender.posRx = (clientX - offset.offsetRight + CastPropController.OffsetX) / offset.dispWidth;
            sender.posRy = (clientY - offset.offsetTop + CastPropController.OffsetY) / offset.dispHeight;
            sender.isDisp = isDisp;

            this._intervalSend.Send(sender, (s) => { this.SendCursorToOwner(s) });
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
        this._baseCursorList = new Array<IconCursorSender>();
        this._cursorList = new Array<CastCursor>();
        this._subtitles = new CastSubTitlesSender("");
        this.DoRender();
    };


    /**
     * ピアの切断等によるカーソル表示の削除
     * @param peerid 
     */
    public Remove(peerid: string) {
        this._baseCursorList = this._baseCursorList.filter(cur => cur.homePeerId !== peerid);
        this._baseCursorList = this._baseCursorList.filter(cur => cur.visitorPeerId !== peerid);
        this._cursorList = this._cursorList.filter(cur => cur.peerid !== peerid);
        this.DisplayAll();
    }


    /**
     * 
     */
    public DisplayAll() {
        CastPropController._vdo = CastPropController._getOffset();
        this._cursorList = new Array<CastCursor>();
        this._baseCursorList.forEach((cur, key) => { this.SetCursorList(cur); });
        this.DoRender();
    }


    /**
     * Sendされてきたカーソルデータを保持して表示
     * @param cursor
     */
    public SetCursor(cursor: IconCursorSender) {

        //  前回の情報は削除して最後尾に追加
        this._baseCursorList = this._baseCursorList.filter((c) => c.homePeerId !== cursor.homePeerId);
        this._baseCursorList.push(cursor);

        CastPropController._vdo = CastPropController._getOffset();
        this.SetCursorList(cursor);
        this.DoRender();
    }


    /**
     * カーソルをリストに追加
     * @param cursor
     */
    private SetCursorList(cursor: IconCursorSender) {

        let vdo = CastPropController._vdo;
        let cursorX = Math.round(cursor.posRx * vdo.dispWidth + vdo.offsetRight);
        let cursorY = Math.round(cursor.posRy * vdo.dispHeight + vdo.offsetTop);

        let dispCursor = new CastCursor(cursor.homePeerId, cursor.aid, cursor.iid, "", cursorX, cursorY, cursor.isDisp);

        //  前回情報は削除して最後尾に追加する
        this._cursorList = this._cursorList.filter((c) => c.peerid !== dispCursor.peerid);
        this._cursorList.push(dispCursor);
    }



    /**
     * 自身のカーソルをCastInstanceに送信する
     * @param sender 
     */
    private SendCursorToOwner(sender: IconCursorSender) {
        this.DispIid = sender.iid;
        this._service.SwPeer.SendToOwner(sender);
    }


    /**
     * 
     * @param cur 
     */
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
        let isIconDispChange = Personal.Actor.IsIconDispChange(cur.actorType);
        let isDispSubtitles = Personal.Actor.IsDispSubtitles(cur.actorType);


        if (isIconDispChange && cur.message.length > 0 && cur.iid !== this.DispIid) {
            this.SendCursorToOwner(this.IconCursor);
        }

        //  メッセージ送信された場合に字幕表示をする
        if (isDispSubtitles && cur.message.length > 0) {
            let msg = new CastSubTitlesSender(cur.message);
            this._service.SwPeer.SendToOwner(msg);
        }

    }


    //  Key: peerid / Value : ( Key: iid / Value: dispratio )
    private _requestMap = new Map<string, Map<string, number>>();


    /**
     * 
     * @param peerid 
     * @param iid 
     */
    private IsRequest(peerid: string, iid: string): boolean {

        let subMap: Map<string, number>;

        if (this._requestMap.has(peerid)) {
            subMap = this._requestMap.get(peerid);
        }
        else {
            subMap = new Map<string, number>();
            this._requestMap.set(peerid, subMap);
        }

        if (subMap.has(iid)) {
            return true;
        }
        else {
            subMap.set(iid, null);
            return false;
        }
    }

    /**
     * アイコン表示処理
     * @param cursors 
     */
    public SetCursorIcon(cursors: Array<CastCursor>) {

        cursors.forEach((cur) => {

            if (cur) {
                if (this.IsRequest(cur.peerid, cur.iid)) {
                    let map = this._requestMap.get(cur.peerid);
                    let dispratio = map.get(cur.iid);
                    if (dispratio) {
                        this.SetIconSize(cur.iid, dispratio);
                    }
                }
                else {
                    //  アイコンが未キャッシュの場合、接続ユーザーにアイコン要求
                    let sender = new GetIconSender();
                    sender.iid = cur.iid;
                    this._service.SwPeer.SendTo(cur.peerid, sender);
                }
            }
        });
    }


    /**
     * アイコン画像の表示及びキャッシュ
     * @param peerid 
     * @param icon
     */
    public SetIcon(peerid: string, icon: Personal.Icon) {

        //  CSS変数として登録
        StyleCache.SetIconStyle(icon.iid, icon.img);

        //  アイコンサイズの指定
        this.SetIconSize(icon.iid, icon.dispratio);

        //  アイコンのサイズ情報キャッシュ
        let map = this._requestMap.get(peerid);
        map.set(icon.iid, icon.dispratio);
    }


    /**
     * アイコンサイズの調整
     * @param iid 
     * @param dispratio 
     */
    public SetIconSize(iid: string, dispratio: number) {

        //  アイコンのサイズ調整
        let size: number;
        if (dispratio && dispratio > 0) {
            size = Math.round(CastPropController._vdo.dispHeight * dispratio / 100);
        }
        else {
            //  デフォルトは高さに対して 8% とする
            size = Math.round(CastPropController._vdo.dispHeight * 8 / 100);
        }
        StyleCache.SetIconSize(iid, size);
    }

}