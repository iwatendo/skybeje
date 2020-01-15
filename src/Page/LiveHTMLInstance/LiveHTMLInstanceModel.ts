
import AbstractServiceModel, { OnModelLoad, OnRead, OnWrite } from "../../Base/AbstractServiceModel";
import * as LiveHTML from "../../Contents/IndexedDB/LiveHTML";
import LiveHTMLInstanceController from "./LiveHTMLInstanceController";


export default class LiveHTMLInstanceModel extends AbstractServiceModel<LiveHTMLInstanceController> {

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
    public GetPageSettings(pageId: string, callback: OnRead<LiveHTML.EmbedPage>) {
        this._liveHTMLDB.Read(LiveHTML.DB.EmbedPage, pageId, callback);
    }



    /**
     * ページ設定の取得
     * @param callback 
     */
    public GetPageSettingsAll(callback: OnRead<Array<LiveHTML.EmbedPage>>) {
        this._liveHTMLDB.ReadAll(LiveHTML.DB.EmbedPage, callback);
    }


    /**
     * ページ設定の更新
     * @param ps 
     * @param callback 
     */
    public UpdatePageSettings(ps: LiveHTML.EmbedPage, callback: OnWrite = null) {
        this._liveHTMLDB.Write<LiveHTML.EmbedPage>(LiveHTML.DB.EmbedPage, ps.pageId, ps, callback);
    }


    /**
     * ページ設定の削除
     * @param ps 
     * @param callback 
     */
    public DeletePageSettings(ps: LiveHTML.EmbedPage, callback: OnWrite = null) {
        this._liveHTMLDB.Delete<LiveHTML.EmbedPage>(LiveHTML.DB.EmbedPage, ps.pageId, callback);
    }

}
