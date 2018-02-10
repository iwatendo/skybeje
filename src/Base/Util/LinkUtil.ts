
export class AutoLinkInfo {

    constructor(isLink: boolean, msg: string) {
        this.isLink = isLink;
        this.msg = msg;
    }

    isLink: boolean;
    msg: string;
}


export default class LinkUtil {

    /**
     * URLのPeerIDを取得します
     */
    public static GetPeerID(): string {
        return this.GetArgs('p');
    }


    /**
     * URLのPidを取得します
     */
    public static GetUrlPid(): number {

        let pid = this.GetArgs('pid');

        if (pid)
            return Number(pid);
        else
            return 0;
    }


    /**
     * URLの引数を取得します
     * @param value
     */
    public static GetArgs(value: string): string {

        return this.GetUrlArgs(location.href, value);
    }


    /**
     * URLの引数を取得します
     * @param url
     * @param value
     */
    public static GetUrlArgs(url: string, value: string): string {

        if (url == null || url.length == 0)
            return null;

        let data = url.split('?');

        if (data.length < 2)
            return null;

        let data2 = data[1].split('&');

        for (let i in data2) {
            let data3 = data2[i].split('=');

            if (data3[0] === value)
                return decodeURIComponent(data3[1]);
        }

        return null;
    }


    /**
     * 
     * @param htmlPath 
     * @param peerid 
     */
    public static CreateLink(htmlPath: string, peerid: string = null): string {

        //  URLは小文字に変換する
        //  ※フォルダ名には大文字が含まれますが、Webサーバー配置時には全て小文字にする為
        htmlPath = htmlPath.toLowerCase();

        let path = window.location.pathname;
        let result: string = "";

        if (htmlPath.indexOf('/') == 0) {
            result = window.location.protocol + htmlPath;
        }
        else {
            let lastpos = path.lastIndexOf('/');

            if (lastpos >= 0) {
                path = path.substring(0, lastpos + 1);
            }

            result = window.location.protocol + "//" + window.location.host + path + htmlPath;
        }

        //  相対パスを絶対パスに変換
        let e: any = document.createElement('span')
        e.insertAdjacentHTML('beforeend', '<a href="' + result + '" />');
        result = e.firstChild.href;

        if (peerid) {
            result += "?p=" + peerid;
        }

        return result;

    }


    /**
     * 文字列に含まれるリンク情報を分解してSplitした配列にする
     * ※ReactでAutoLinkを実現する為の処理
     * @param baseText 
     */
    public static AutoLinkAnaylze(baseText:string) : Array<AutoLinkInfo>{

        let workText = baseText;
        let result = new Array<AutoLinkInfo>();

        while (workText.length > 0) {
            let re = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            let rega = re.exec(workText);

            if (rega) {

                //  リンク文字列が検出された場合

                //  リンク文字列までは通常出力
                result.push(new AutoLinkInfo(false, workText.substr(0, rega.index)));

                //  リンク部分の抽出
                let linkStr = rega[0];
                let link = workText.substr(rega.index, linkStr.length);
                result.push(new AutoLinkInfo(true, linkStr));

                //  処理した部分までを削除し、リンク文字列がなくなるまでループする
                workText = workText.substr(rega.index + linkStr.length);
            } else {
                //  リンク文字列が検出されなかった場合は通常出力
                result.push(new AutoLinkInfo(false, workText));
                workText = "";
            }
        }

        return result;
    }

}
