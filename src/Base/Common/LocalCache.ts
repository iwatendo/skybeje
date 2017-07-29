
import { LiveCastOptions } from "../../Page/CastInstance/CastInstanceContainer";
import StdUtil from "../Util/StdUtil";

export interface OnSetOptions { (option: LiveCastOptions): void };

/**
 * ローカルストレージに対するデータ操作を行います。
 * このクラスを経由しないローカルストレージの使用は禁止します
 */
export default class LocalCache {

    /**
     * ローカルストレージを全てクリアした場合
     * InitializedSkybejeもクリアされ、起動時にIndexedDBも全て初期化される事に注意してください。
     */
    public static Clear() {
        localStorage.clear();
    }

    /**
     *  ユーザーID / 初回起動時にランダムで設定されます
     */
    public static set UserID(val: string) { localStorage.setItem('user-id', val); }
    public static get UserID(): string {
        let uid = localStorage.getItem('user-id');
        if (!uid) {
            uid = StdUtil.CreateUuid();
            this.UserID = uid;
        }
        return uid;
    }


    /**
     *  IndexedDBの初期化済みフラグ
     * 
     *  初回起動時 及び 「データの初期化」実行時にIndexedDBを初期化するか判定するフラグです。
     *  この値がTrueに設定されていない場合、起動時に初期化処理が実行されます。
     */
    public static set InitializedSkybeje(val: boolean) { localStorage.setItem('initialized-skybeje', (val ? "True" : "")) }
    public static get InitializedSkybeje(): boolean { return localStorage.getItem('initialized-skybeje') === "True" }


    /**
     *  起動しているインスタンスのPeerID
     */
    public static set BootHomeInstancePeerID(val: string) { localStorage.setItem('home-instance-id', val); }
    public static get BootHomeInstancePeerID(): string { return localStorage.getItem('home-instance-id'); }


    /**
     *  起動しているインスタンスのPeerID
     */
    public static set IsCheckDevicePermision(val: boolean) { localStorage.setItem('checked-device-permision', (val ? "True" : "")); }
    public static get IsCheckDevicePermision(): boolean { return localStorage.getItem('checked-device-permision') === "True" }



    /**
     *  ライブキャスト時のオプション設定
     */
    public static get LiveCastOptions(): LiveCastOptions {
        let value = localStorage.getItem('live-cast-options');
        return (value ? JSON.parse(value) as LiveCastOptions : new LiveCastOptions());
    }
    public static SetLiveCastOptions(setoptions: OnSetOptions) {
        let options = this.LiveCastOptions;
        setoptions(options);
        localStorage.setItem('live-cast-options', JSON.stringify(options));
    }

    /**
     * チャット時のEnterの振舞い設定
     */
    public static set ChatEnterMode(val: number) {
        localStorage.setItem('enter-mode', val.toString());
    }
    public static get ChatEnterMode(): number {
        let value = localStorage.getItem('enter-mode');
        return (value ? Number.parseInt(value) : 0);
    }


    /**
     * アクター変更のショートカットキーのモード
     */
    public static set ActorChangeKeyMode(val: number) {
        localStorage.setItem('actor-change-keymode', val.toString());
    }
    public static get ActorChangeKeyMode(): number {
        let value = localStorage.getItem('actor-change-keymode');
        return (value ? Number.parseInt(value) : 0);
    }

}