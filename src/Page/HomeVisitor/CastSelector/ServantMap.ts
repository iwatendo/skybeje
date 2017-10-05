
import { ServantSender, RoomServantSender } from "../../HomeInstance/HomeInstanceContainer";
import CastSelectorController from "./CastSelectorController";


/**
 * 表示しているサーバントの管理クラス
 */
export default class ServantMap {

    private _controller: CastSelectorController;
    private _map = new Map<number, ServantSender>();


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
    public Get(index: number): ServantSender {
        return this._map.get(index);
    }


    /**
     * サーバントの設定
     * @param servants 
     * @param changecallbak 
     */
    public SetServants(servants: ServantSender[], changecallbak) {

        let newServant = new Array<ServantSender>();
        let preMap = new Map<number, ServantSender>();
        let isDelete = false;
        let isAppend = false;

        //  設置済みのサーバント判定
        servants.forEach((servant) => {
            let preIndex = this.GetServantPos(servant);
            if (preIndex >= 0) {
                preMap.set(preIndex, servant);
            }
            else {
                newServant.push(servant);
            }
        });

        //  削除されたサーバントの除去
        for (let i = 0; i < this._controller.FrameCount; i++) {
            if (!preMap.has(i)) {
                if (this._map.has(i)) {
                    this._controller.RemoveServantFrame(i);
                    this._map.delete(i);
                    isDelete = true;
                }
            }
        }

        //  新規サーバントの追加
        newServant.forEach((servant) => {
            for (let i = 0; i < this._controller.FrameCount; i++) {
                if (preMap.has(i))
                    continue;

                this._controller.SetServantFrame(i, servant);
                preMap.set(i, servant);
                this._map.set(i, servant);
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
     * @param servant 
     */
    private GetServantPos(servant: ServantSender): number {

        let result = -1;

        this._map.forEach((item, index) => {
            if (servant.clientUrl === item.clientUrl) {
                result = index;
            }
        });
        return result;
    }

}