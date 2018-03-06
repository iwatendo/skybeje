import DBContainer from "../../Contents/IndexedDB/DBContainer";
import LocalCache from "../../Contents/Cache/LocalCache";
import LinkUtil from "../../Base/Util/LinkUtil";

let dbc = new DBContainer();

if (LocalCache.Initialize) {

    document.getElementById('sbj-initialize-execute').hidden = false;

    dbc.RemoveAll(() => {

        localStorage.clear();

        document.getElementById('sbj-initialize-timeout').hidden = true;
        document.getElementById('sbj-initialize-done').hidden = false;

        setTimeout(() => {
            //  閉じる
            window.open('about:blank', '_self').close();
            //  閉じれない場合はトップベージに遷移
            location.href = LinkUtil.CreateLink("/");
        }, 1000);

    });

    setTimeout(() => {
        document.getElementById('sbj-initialize-timeout').hidden = false;
    }, 5000);
}
else {
    document.getElementById('sbj-initialize-boot-error').hidden = false;
}
