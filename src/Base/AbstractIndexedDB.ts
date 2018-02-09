import LogUtil from "./Util/LogUtil";
import FileUtil from "./Util/FileUtil";

interface OnCreateDB { (): void };
export interface OnRemoveDB { (): void };
interface ObtainWritekey<T> { (T): string };
interface OnReadObject<T> { (T): void };
interface OnWriteDB<T> { (): void };
interface OnDeleteObject<T> { (): void };
interface OnClearObject<T> { (): void };
interface OnConnect { (): void };
interface OnError { (ev: Event): void };
export interface OnLoadComplete<T> { (data: T): void }
export interface OnWriteComplete { (): void }


export default abstract class AbstractIndexedDB<D> {

    protected _dbname: string;
    protected _db: IDBDatabase;
    protected _storelist: Array<string>;

    constructor(name: string) {
        this._dbname = name;
        this._storelist = new Array<string>();
    }


    protected SetStoreList(name: string) {
        this._storelist.push(name);
    }


    private OnError(e: Event) {
        LogUtil.Error(null, (<IDBRequest>event.target).error.toString());
    }


    protected Create(onCreate: OnCreateDB) {
        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);
        rep.onupgradeneeded = (e) => this.CreateStore(e);
        rep.onsuccess = (es) => { onCreate(); };
        rep.onerror = this.OnError;
    }


    private CreateStore(event: IDBVersionChangeEvent) {
        this._db = (<IDBRequest>event.target).result;
        this._storelist.forEach((s) => this._db.createObjectStore(s));
    }


    public Remove(onRemove: OnRemoveDB) {

        if (this._db)
            this._db.close();

        let req = window.indexedDB.deleteDatabase(this._dbname);
        req.onsuccess = (es) => {
            onRemove();
        };
        req.onerror = this.OnError;

        req.onblocked = (es: IDBVersionChangeEvent) => {
            LogUtil.Warning(null, "Delete blocked : " + this._dbname);
        };

        req.onupgradeneeded
    }


    public Connect(onconnect: OnConnect) {
        let rep: IDBOpenDBRequest = window.indexedDB.open(this._dbname, 2);

        rep.onupgradeneeded = (e) => {
            this.CreateStore(e);
        }

        rep.onerror = this.OnError;

        rep.onsuccess = (event) => {
            this._db = (<IDBRequest>event.target).result;
            onconnect();
        };
    }


    public Write<T>(name: string, key: IDBKeyRange | IDBValidKey, data: T, callback: OnWriteDB<T> = null) {

        let trans = this._db.transaction(name, 'readwrite');
        let store = trans.objectStore(name);

        if (key) {
            let request = store.put(data, key);
            request.onerror = this.OnError;
            if (callback != null) {
                request.onsuccess = (event) => { callback(); }
            }
        }
        else {
            LogUtil.Error(null, "Write key error : Store " + name);
        }
    }


    public Delete<T>(name: string, key: IDBKeyRange | IDBValidKey, callback: OnDeleteObject<T> = null) {
        let trans = this._db.transaction(name, 'readwrite');
        let store = trans.objectStore(name);
        let request = store.delete(key);
        request.onerror = this.OnError;

        if (callback != null) {
            request.onsuccess = (event) => { callback(); }
        }
    }


    public WriteAll<T>(name: string, getkey: ObtainWritekey<T>, datalist: Array<T>, callback: OnWriteDB<T> = null) {

        let writefunc = (data) => {

            if (data == undefined) {
                if (callback != null)
                    callback();
            }
            else {
                this.Write(name, getkey(data), data, () => {
                    writefunc(datalist.pop());
                });
            }
        };

        writefunc(datalist.pop());
    }


    public Read<T, K>(name: string, key: K, callback: OnReadObject<T>, onerror: OnError = null) {

        let trans = this._db.transaction(name, 'readonly');
        let store = trans.objectStore(name);
        let request = store.get(key);

        if (onerror)
            request.onerror = this.OnError;
        else
            request.onerror = onerror;

        request.onsuccess = (event) => {
            let result: T = (<IDBRequest>event.target).result as T;
            //  LogUtil.Info("Loading complete : " + this._dbname + "." + name);
            callback(result);
        };

    }

    public ReadAll<T>(name: string, callback: OnReadObject<Array<T>>) {

        this._db.onerror = this.OnError;
        let trans = this._db.transaction(name, 'readonly');
        let store = trans.objectStore(name);
        let request = store.openCursor();

        let result: Array<T> = new Array<T>();

        request.onerror = this.OnError;
        request.onsuccess = (event) => {
            let cursor = <IDBCursorWithValue>(<IDBRequest>event.target).result;

            if (cursor) {
                let msg = cursor.value as T;
                if (msg)
                    result.push(cursor.value);

                cursor.continue();
            }
            else {
                //  LogUtil.Info("Loading complete : " + this._dbname + "." + name);
                callback(result);
            }
        };

    }

    public ClearAll<T>(name: string, callback: OnClearObject<T>) {

        let trans = this._db.transaction(name, 'readwrite');
        let store = trans.objectStore(name);
        let request = store.openCursor();

        store.clear();

        request.onerror = this.OnError;
        request.onsuccess = (event) => {
            callback();
        };

    }

    public abstract GetName(): string;

    public abstract GetNote(): string;

    public abstract ReadAllData(onload: OnLoadComplete<D>);

    public abstract WriteAllData(data: D, callback: OnWriteComplete);

    public abstract IsImportMatch(data: any): boolean;

    public abstract Import(data: D, callback: OnWriteComplete);


    /**
     * データのエクスポート処理
     */
    public Export() {

        let defaultFileName = FileUtil.GetDefaultFileName(this._dbname);

        this.ReadAllData((data) => {
            let str = JSON.stringify(data);
            FileUtil.Export(defaultFileName, str);
        });
    }

}