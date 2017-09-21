
/**
 * 
 */
import LogUtil from "./LogUtil";
import LinkUtil from "./LinkUtil";

export default class StdUtil {

    /**
     * 動作するブラウザかチェック
     * ※現状は Google Chromeにのみ対応
     */
    public static IsSupportBrowser(isLiveCast: boolean): boolean {

        //  対応ブラウザかチェック
        let ua = window.navigator.userAgent.toLowerCase();

        if (isLiveCast) {
            if (ua.indexOf('safari') >= 0) {
                return true;
            }
        }

        if (ua.indexOf('chrome') >= 0) {
            if ((ua.indexOf('msie') < 0) && (ua.indexOf('trident/7') < 0) && (ua.indexOf('edge') < 0)) {
                return true;
            }
        }
    }


    /**
     * 
     */
    public static IsSafari() {
        let ua = window.navigator.userAgent.toLowerCase();

        if (ua.indexOf('chrome') >= 0) {
            return false;
        }

        if (ua.indexOf('safari') >= 0) {
            return true;
        }
        else {
            return false;
        }
    }


    /**
     * ブラウザチェック
     */
    public static IsExecute(isLiveCast: boolean = false): boolean {

        if (this.IsSupportBrowser(isLiveCast)) {
            return true;
        }
        else {
            //  未対応ブラウザで実行された場合、エラーページを表示
            window.location.href = LinkUtil.CreateLink("../ErrorPage/");
            return false;
        }

    }


    /**
     * Arrayの重複を除去する
     * @param list 
     */
    public static Uniq<T>(list: Array<T>): Array<T> {

        let map = new Map<T, T>();

        list.forEach((value) => {
            map.set(value, value);
        });

        let result = new Array<T>();

        map.forEach((value, key) => {
            result.push(key);
        });

        return result;
    }


    /**
     * ハッシュコード生成
     * @param value 
     */
    public static ToHashCode(value): number {

        let hash = 0;

        if (value.length == 0) {
            return hash;
        }

        for (let i: number = 0; i < value.length; i++) {
            let char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }


    /**
     * ディープコピー
     * ※Date/Function/undefined についてはコピーされないので注意。
     * @param value 
     */
    public static DeepCopy<T>(value: T): T {

        //  http://qiita.com/seihmd/items/74fa9792d05278a2e898
        return JSON.parse(JSON.stringify(value));

        //  return Object.assign<T, T>({} as T, value);
    }


    /**
     * 日付の表示変換
     * @param date
     */
    public static ToDispDate(date: Date) {
        return date.getFullYear()
            + "-" + ("0" + (date.getMonth() + 1)).slice(-2)
            + "-" + ("0" + date.getDate()).slice(-2)
            + " " + ("0" + date.getHours()).slice(-2)
            + ":" + ("0" + date.getMinutes()).slice(-2)
            + ":" + ("0" + date.getSeconds()).slice(-2)
            + "." + ("00" + date.getMilliseconds()).slice(-3)
    }

    /**
     * UUIDの生成
     */
    public static CreateUuid(): string {

        let result: string = "";

        for (let i = 0; i < 32; i++) {

            let random: number = Math.random() * 16 | 0;

            if (i == 8 || i == 12 || i == 16 || i == 20)
                result += "-"

            result += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return result;
    }


    /**
     * ユニークキーの生成
     */
    public static UniqKey(): string {
        return this.CreateUuid();
    }


    /**
     * XSS対策及び改行コード変換
     * @param msg
     */
    public static ToHtml(msg: string): string {
        msg = this.htmlspecialchars(msg);

        //  HTMLリンクをリンクにする
        let exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        msg = msg.replace(exp, "<a target='_blank' href='$1'>$1</a>");

        return msg.replace(/\n/g, '<br/>');
    }


    /**
     * XSS対策
     * @param ch
     */
    public static htmlspecialchars(ch: string): string {
        ch = ch.replace(/&/g, "&amp;");
        ch = ch.replace(/"/g, "&quot;");
        ch = ch.replace(/'/g, "&#039;");
        ch = ch.replace(/</g, "&lt;");
        ch = ch.replace(/>/g, "&gt;");
        return ch;
    }


    /**
     * テキストを改行コードでsplit
     * @param value 
     */
    public static TextLineSplit(value: string): Array<string> {

        if (value.indexOf('\n') < 0) {
            let result = new Array<string>();
            result.push(value);
            return result;
        }
        else {
            //  改行コードがある場合の制御
            let msgs = value.split('\n');

            //  最終行が空の場合は除去
            if (msgs[msgs.length - 1].length == 0) {
                msgs = msgs.slice(0, msgs.length - 1);
            }

            return msgs;
        }
    }


    /**
     * ページへのデフォルトドロップイベントを発生させなくする
     */
    public static StopPropagation() {

        document.ondrop = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };

        document.ondragover = (e) => {
            e.stopPropagation();
            e.preventDefault();
        };
    }


    /**
     * タッチパネルイベントの抑制（スライドでのページ遷移の抑制）
     */
    public static StopTouchmove() {

        if (!(window as any).TouchEvent) {
            return;
        }

        if (window.addEventListener) {
            function TouchEventFunc(e) { }
            // タッチしたまま平行移動すると実行されるイベント
            document.addEventListener("touchmove", TouchEventFunc);
        }

        //  PullToRefresh対策
        //  http://qiita.com/sundaycrafts/items/5ad6bbea8800ad3d764b
        //  http://elsur.xyz/android-preventdefault-error
        //  を参考に実装
        //  無効化できない端末がありますが、現状では致命的な問題では無い為、保留します。
        let preventPullToRefresh = ((lastTouchY) => {

            lastTouchY = lastTouchY || 0;
            let maybePrevent = false;

            function setTouchStartPoint(e) {
                lastTouchY = e.touches[0].clientY;
            }

            function isScrollingUp(e) {
                let touchY = e.touches[0].clientY;
                let touchYDelta = touchY - lastTouchY;
                lastTouchY = touchY;
                return (touchYDelta > 0);
            }

            return {
                touchstartHandler: (e) => {
                    if (e.touches.length != 1) return;

                    setTouchStartPoint(e);
                    maybePrevent = (window.pageYOffset === 0);
                },
                touchmoveHandler: (e) => {

                    if (maybePrevent) {
                        maybePrevent = false;
                        if (isScrollingUp(e)) {
                            e.preventDefault();             //  prevantDefaultでは無効化できない？
                            e.stopImmediatePropagation();   //  Nexus7の場合、これで無効化できるが、Nexus9では無効化できない
                            return;
                        }
                    }
                }
            }
        })();

        document.addEventListener('touchstart', preventPullToRefresh.touchstartHandler);
        document.addEventListener('touchmove', preventPullToRefresh.touchmoveHandler);

    }

}
