import ImageInfo, { BgPosEnum, BgRepeatEnum, BgSizeEnum } from "../../Base/Container/ImageInfo";
import { Icon } from "../IndexedDB/Personal";

export default class StylelCache {


    /*---------------------------------------------
    //  チャットメッセージのCSS設定
    //-------------------------------------------*/

    private static _msgCssMap = new Map<string, string>();

    /**
     * タイムラインのCSS指定取得
     * @param key 
     */
    public static GetTimelineMsgStyle(key: string): any {

        if (!this._msgCssMap.has(key)) {
            //  デフォルト設定
            document.documentElement.style.setProperty('--sbj-msgc-' + key, "var(--sbj-color-timeline-message)");
            document.documentElement.style.setProperty('--sbj-msgbc-' + key, "var(--sbj-color-timeline-ballon)");
        }

        return {
            color: 'var(--sbj-msgc-' + key + ')',
            backgroundColor: 'var(--sbj-msgbc-' + key + ')',
        };
    }


    /**
     * タイムラインのCSS指定
     * @param key 
     * @param rec 
     */
    public static SetTimelineMsgStyle(key: string, icon: Icon) {

        //  チャットの文字色 / 背景色設定
        if (icon && icon.msgcolor.length > 0 && icon.msgbackcolor.length > 0) {
            if (this._msgCssMap.has(key)) {
                return;
            }
            else {
                document.documentElement.style.setProperty('--sbj-msgc-' + key, icon.msgcolor);
                document.documentElement.style.setProperty('--sbj-msgbc-' + key, icon.msgbackcolor);
                this._msgCssMap.set(key, key);
            }
        }

    }



    /*---------------------------------------------
    //  画像データのCSS
    //-------------------------------------------*/

    private static _imgCssMap = new Map<string, string>();

    /**
     * 画像のCSS指定取得
     * @param key 
     */
    public static GetImageStyle(key: string): any {

        //  デフォルト設定
        if (!this._imgCssMap.has(key)) {
            document.documentElement.style.setProperty('--sbj-bgc-' + key, 'rgba(0,0,0,.3)');
        }

        return {
            background: 'var(--sbj-imgbg-' + key + ')',
            backgroundSize: 'var(--sbj-imgbgs-' + key + ')',
            backgroundRepeat: 'var(--sbj-imgbgr-' + key + ')',
            backgroundPosition: 'var(--sbj-imgbgp-' + key + ')',
            backgroundColor: 'var(--sbj-bgc-' + key + ')'
        };
    }


    /**
     * 画像のCSS指定
     * @param key 
     * @param rec 
     */
    public static SetImageStyle(key: string, rec: ImageInfo) {
        if (this._imgCssMap.has(key)) {
            return;
        }
        else {
            if (rec) {
                document.documentElement.style.setProperty('--sbj-bgc-' + key, "");
                document.documentElement.style.setProperty('--sbj-imgbg-' + key, 'url(' + rec.src + ')');
                document.documentElement.style.setProperty('--sbj-imgbgs-' + key, this.SizeEnumToString(rec.backgroundsize));
                document.documentElement.style.setProperty('--sbj-imgbgr-' + key, this.RepeatEnumToString(rec.backgroundrepeat));
                document.documentElement.style.setProperty('--sbj-imgbgp-' + key, this.PosEnumToString(rec.backgroundposition));
                document.documentElement.style.setProperty('--sbj-imgbg-' + key, 'url(' + rec.src + ')');
            }
            this._imgCssMap.set(key, key);
        }
    }


    /**
     * 
     * @param value 
     */
    private static SizeEnumToString(value: BgSizeEnum) {
        switch (value) {
            case BgSizeEnum.Contain: return "contain";
            case BgSizeEnum.Cover: return "cover";
        }
        return "";
    }


    /**
     * 
     * @param value 
     */
    private static PosEnumToString(value: BgPosEnum) {
        switch (value) {
            case BgPosEnum.Center: return "center";
            case BgPosEnum.Top: return "top";
            case BgPosEnum.Left: return "left";
            case BgPosEnum.Right: return "right";
            case BgPosEnum.Bottom: return "bottom";
        }
        return "";
    }


    /**
     * 
     * @param value 
     */
    private static RepeatEnumToString(value: BgRepeatEnum) {
        switch (value) {
            case BgRepeatEnum.Repeat: return "repeat";
            case BgRepeatEnum.RepeatX: return "repeat-x";
            case BgRepeatEnum.RepeatY: return "repeat-y";
            case BgRepeatEnum.NoRepeat: return "no-repeat";
        }
        return "";
    }


}
