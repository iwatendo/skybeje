
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";
import * as LiveHTML from "../../Contents/IndexedDB/LiveHTML";
import LiveDomInstanceController from "./LiveDomInstanceController";


export default class LiveDomInstanceModel extends AbstractServiceModel<LiveDomInstanceController> {

    private _liveHTMLDB: LiveHTML.DB;

    /**
     * 初期化処理
     * @param callback 
     */
    protected Initialize(callback: OnModelLoad) {
        this._liveHTMLDB = new LiveHTML.DB();

        this._liveHTMLDB.Connect(() => {
            callback();
        });
    }


    /**
     * ページ設定の取得
     * @param pageId 
     * @param callback 
     */
    public GetPageSettings(pageId: string, callback: OnRead<LiveHTML.PageSettings>) {
        this._liveHTMLDB.Read(LiveHTML.DB.PageSettings, pageId, callback);
    }



    /**
     * ページ設定の取得
     * @param callback 
     */
    public GetPageSettingsAll(callback: OnRead<Array<LiveHTML.PageSettings>>) {
        this._liveHTMLDB.ReadAll(LiveHTML.DB.PageSettings, callback);
    }


    /**
     * ページ設定の更新
     * @param ps 
     * @param callback 
     */
    public UpdatePageSettings(ps: LiveHTML.PageSettings, callback: OnWrite = null) {
        this._liveHTMLDB.Write<LiveHTML.PageSettings>(LiveHTML.DB.PageSettings, ps.pageId, ps, callback);
    }


    /**
     * ページ設定の削除
     * @param ps 
     * @param callback 
     */
    public DeletePageSettings(ps: LiveHTML.PageSettings, callback: OnWrite = null) {
        this._liveHTMLDB.Delete<LiveHTML.PageSettings>(LiveHTML.DB.PageSettings, ps.pageId, callback);
    }

}
