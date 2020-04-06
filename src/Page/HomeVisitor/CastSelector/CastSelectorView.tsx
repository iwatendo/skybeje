import * as React from 'react';
import * as ReactDOM from 'react-dom';

import HomeVisitorController from "../HomeVisitorController";
import ServentFrame from "./ServentFrame";
import ServentListComponent from './ServentListComponent';
import StdUtil from '../../../Base/Util/StdUtil';
import ServentSender from '../../../Contents/Sender/ServentSender';
import ServentMap from './ServentMap';


/**
 * 配信表示
 */
export default class CastSelectorView {

    //  最大フレーム数
    private _MAX_FRAME_COUNT = 4;

    //  配信リスト一覧表示エレメント
    private _castListElement = document.getElementById('sbj-home-visitor-servent-list');

    //  配信リスト表示ボタンエレメント
    private _castListDispButtonElement = document.getElementById('sbj-home-visitor-servent-list-disp');

    //  配信情報MAP
    private _serventMap: ServentMap;

    //  フレーム一覧
    private _serventFrameList: Array<ServentFrame>;

    //  表示するフレーム数
    private _dispFrameCount = 1;

    //  フレームの表示順
    private _dispFrameNoArray = new Array<number>();


    /**
     * コンストラクタ
     * @param controller 
     */
    constructor(controller: HomeVisitorController) {

        this._serventMap = new ServentMap(this, this._MAX_FRAME_COUNT);
        this._serventFrameList = new Array<ServentFrame>();

        for (let frameNo = 0; frameNo < this._MAX_FRAME_COUNT; frameNo++) {
            let sf = new ServentFrame(controller, frameNo);
            this._serventFrameList.push(sf);
        }
    }


    /**
     * サーバントの表示
     * @param servents 
     */
    public SetServents(servents: ServentSender[]) {

        this._serventMap.SetServents(servents, () => {
            //  変更があった場合
            this.ChangeDispFrameCount(servents.length);
            this.SetLayout();
        });

    }


    /**
     * 指定フレームにサーバント(配信URL)を設定
     * @param frameNo フレーム番号
     * @param servent 配信URL
     */
    public SetFrame(frameNo: number, servent: ServentSender) {

        if (servent) {

            this._serventFrameList[frameNo].Set(servent);

            if (this._dispFrameCount < this._dispFrameNoArray.length) {
                this._dispFrameNoArray.push(frameNo);
                this.SetLayout();
            }
       }
    }


    /**
     * 指定フレームのサーバント（配信URL）をクリア
     * @param frameNo 
     */
    public ClearFrame(frameNo: number) {

        let sf = this._serventFrameList[frameNo];
        sf.Clear();

        if (this._dispFrameNoArray.length > 0) {
            //  フレーム番号と表示番号の対応表の更新
            let newArray = new Array<number>();
            this._dispFrameNoArray.filter((i) => (i !== frameNo)).forEach((i) => { newArray.push(i); });
            this._dispFrameNoArray = newArray;
        }

        this.SetLayout();
    }


    /**
     * 表示するサーバント件数を変更
     * @param serventCount 
     */
    private ChangeDispFrameCount(serventCount: number) {
        
        this._dispFrameCount = this.ToDispFrameCount(serventCount);
        this._dispFrameNoArray = this._dispFrameNoArray.slice(0, this._dispFrameCount);

        while (this._dispFrameNoArray.length < this._dispFrameCount) {

            let frameNo = this.GetNonDispFrameNo();

            if (frameNo >= 0) {
                this._dispFrameNoArray.push(frameNo);
            }
            else {
                break;
            }
        }
    }


    /**
     * 画面分割数を取得
     * @param serventCount 
     */
    private ToDispFrameCount(serventCount: number) {
        if (serventCount >= 3) return 4;
        if (serventCount >= 2) return 2;
        if (serventCount >= 1) return 1;
        return 0;
    }


    /**
     * キャスト中
     * かつ非表示のフレーム番号を取得
     */
    private GetNonDispFrameNo(): number {

        for (let frameNo = 0; frameNo < this._MAX_FRAME_COUNT; frameNo++) {

            let sf = this._serventFrameList[frameNo];

            if (sf.IsCasting) {
                let pre = this._dispFrameNoArray.filter(n => (n === frameNo));

                if (pre.length === 0) {
                    return frameNo;
                }
            }
        }

        return -1;
    }


    /**
     * レイアウト
     */
    public SetLayout() {

        //  配信状態のサービスがあるか？
        let hasCasting = false;

        for (let frameIndex = 0; frameIndex < this._MAX_FRAME_COUNT; frameIndex++) {

            //  一度全てのフレームを非表示状態にする
            let sf = this._serventFrameList[frameIndex];
            sf.Frame.hidden = true;

            //  配信状態のサービスがある場合
            if (sf.IsCasting) {
                hasCasting = true;
            }
        }

        //  配信中サービス一覧ボタンの表示／非表示切替
        //  ※１つでも配信中のサービスがあれば表示する
        this._castListDispButtonElement.hidden = !hasCasting;

        for (let dispIndex = 0; dispIndex < this._dispFrameNoArray.length; dispIndex++) {
            let frameNo = this._dispFrameNoArray[dispIndex];
            let sf = this._serventFrameList[frameNo];
            sf.SetLayout(dispIndex, this._dispFrameCount);
        }

        let key = StdUtil.CreateUuid();

        ReactDOM.render(<ServentListComponent
            key={key}
            view={this}
            servents={this._serventFrameList} />
            , this._castListElement);
    }

}