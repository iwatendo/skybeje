
import { ServentSender, RoomServentSender } from "../../HomeInstance/HomeInstanceContainer";
import CastSelectorController from "./CastSelectorController";


/**
 * 表示しているサーバントの管理クラス
 */
export default class ServentMap {

    private _controller: CastSelectorController;
    private _map = new Map<number, ServentSender>();


    /**
     * 
     * @param controller 
     */
    constructor(controller: CastSelectorController) {
        this._controller = controller;
    }


    /**
     * 
     * @param index 
     */
    public Has(index: number): boolean {
        return this._map.has(index);
    }


    /**
     * 
     * @param index 
     */
    public Get(index: number): ServentSender {
        return this._map.get(index);
    }


    /**
     * サーバントの設定
     * @param servents 
     * @param changecallbak 
     */
    public SetServents(servents: ServentSender[], changecallbak) {

        let newServent = new Array<ServentSender>();
        let preMap = new Map<number, ServentSender>();
        let isDelete = false;
        let isAppend = false;

        //  設置済みのサーバント判定
        servents.forEach((servent) => {
            let preIndex = this.GetServentPos(servent);
            if (preIndex >= 0) {
                preMap.set(preIndex, servent);
            }
            else {
                newServent.push(servent);
            }
        });

        //  削除されたサーバントの除去
        for (let i = 0; i < this._controller.FrameCount; i++) {
            if (!preMap.has(i)) {
                if (this._map.has(i)) {
                    this._controller.RemoveServentFrame(i);
                    this._map.delete(i);
                    isDelete = true;
                }
            }
        }

        //  新規サーバントの追加
        newServent.forEach((servent) => {
            for (let i = 0; i < this._controller.FrameCount; i++) {
                if (preMap.has(i))
                    continue;

                this._controller.SetServentFrame(i, servent);
                preMap.set(i, servent);
                this._map.set(i, servent);
                i = this._controller.FrameCount;

                isAppend = true;
            }
        });

        if (isDelete || isAppend) {
            changecallbak();
        }

    }


    /**
     * 指定されたサーバントが含まれているか？
     * @param servent 
     */
    private GetServentPos(servent: ServentSender): number {

        let result = -1;

        this._map.forEach((item, index) => {
            if (servent.clientUrl === item.clientUrl) {
                result = index;
            }
        });
        return result;
    }

}