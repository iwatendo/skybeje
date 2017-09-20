
import * as JQuery from "jquery";
import LinkUtil from "../../Base/Util/LinkUtil";

var linkurl = LinkUtil.GetArgs("linkurl");
var qrcode: any = $('#qrcode');
qrcode.qrcode(linkurl);

(document.getElementById('qrcode') as HTMLElement).ondblclick = (e) => {
    //  デバック用に Ctrl + ダブルクリックで新規ウィンドウで開く
    if (e.ctrlKey || e.altKey || e.shiftKey) {
        window.open(linkurl);
    }
}
