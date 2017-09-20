
import StdUtil from "../../Base/Util/StdUtil";

if (StdUtil.IsSupportBrowser(false)) {
    document.getElementById('sbj-error-msg').innerHTML = "";
}

let url = sessionStorage.getItem("ErrorUrl");

if (url && url.length > 0) {
    document.getElementById('sbj-error-url').textContent = url;
    document.getElementById('sbj-error-disp').hidden = false;
}
else {
    document.getElementById('sbj-error-disp').hidden = true;
}

let msg = sessionStorage.getItem("ErrorMsg");

if (msg) {
    let dispMsg = "";
    msg.split('\n').forEach(n => dispMsg += n + "<br/>");

    if (dispMsg.length > 0) {
        document.getElementById('sbj-error-msg').innerHTML = dispMsg;
    }
}